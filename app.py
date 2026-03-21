import os
import sqlite3
from functools import wraps
from flask import (
    Flask, render_template, request, redirect, url_for,
    session, flash, g, jsonify, make_response, Response, send_from_directory
)
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from authlib.integrations.flask_client import OAuth
from datetime import timedelta
from whitenoise import WhiteNoise
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)
app.wsgi_app = WhiteNoise(app.wsgi_app, root="static/")
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-change-in-production")

UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER", os.path.join("static", "images", "uploads"))
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ── Google OAuth Configuration ──────────────────────────────────────────────
app.config['GOOGLE_CLIENT_ID']     = os.environ.get("GOOGLE_CLIENT_ID", "")
app.config['GOOGLE_CLIENT_SECRET'] = os.environ.get("GOOGLE_CLIENT_SECRET", "")

app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=730)  
app.config['SESSION_COOKIE_SECURE'] = True   
app.config['SESSION_COOKIE_HTTPONLY'] = True    
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax' 

oauth = OAuth(app)
google = oauth.register(
    name="google",
    client_id=app.config['GOOGLE_CLIENT_ID'],
    client_secret=app.config['GOOGLE_CLIENT_SECRET'],
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

# ── Database ──────────────────────────────────────────────────────────────────
DATABASE = os.environ.get("DATABASE_PATH", "kerkoauto.db")

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(e=None):
    db = g.pop("db", None)
    if db:
        db.close()

def init_db():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    db.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name  TEXT NOT NULL,
            last_name   TEXT NOT NULL,
            email       TEXT UNIQUE NOT NULL,
            password    TEXT,
            google_id   TEXT,
            is_admin    INTEGER DEFAULT 0,
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS cars (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id      INTEGER NOT NULL,
            marka        TEXT NOT NULL,
            modeli       TEXT NOT NULL,
            viti         INTEGER,
            generazione  TEXT,
            cmimi        REAL NOT NULL,
            currency     TEXT DEFAULT 'EUR',
            karburant    TEXT,
            kambio       TEXT,
            forma        TEXT,
            km           INTEGER,
            description  TEXT,
            location     TEXT,
            contact_name TEXT,
            phone        TEXT,
            views        INTEGER DEFAULT 0,
            status       TEXT DEFAULT 'pending',
            created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS car_images (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            car_id    INTEGER NOT NULL,
            filename  TEXT NOT NULL,
            is_main   INTEGER DEFAULT 0,
            FOREIGN KEY (car_id) REFERENCES cars(id)
        );

        CREATE TABLE IF NOT EXISTS blogs (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            title      TEXT NOT NULL,
            category   TEXT,
            content    TEXT NOT NULL,
            image      TEXT,
            author_id  INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (author_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS contacts (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT NOT NULL,
            email      TEXT NOT NULL,
            subject    TEXT,
            message    TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    """)
    db.commit()
    db.close()

def migrate_db():
    """Add new columns to existing databases without breaking existing data."""
    db = sqlite3.connect(DATABASE)
    migrations = [
        "ALTER TABLE cars ADD COLUMN kambio TEXT",
        "ALTER TABLE cars ADD COLUMN forma TEXT",
        "ALTER TABLE cars ADD COLUMN contact_name TEXT",
        "ALTER TABLE cars ADD COLUMN phone TEXT",
        "ALTER TABLE cars ADD COLUMN views INTEGER DEFAULT 0",
        "ALTER TABLE cars ADD COLUMN generazione TEXT",
    ]
    for sql in migrations:
        try:
            db.execute(sql)
        except Exception:
            pass  # column already exists
    db.commit()
    db.close()


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# Run DB setup at import time (works for both `flask run` and gunicorn)
init_db()
migrate_db()

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            flash("Duhet të hysh për të vazhduar.", "warning")
            return redirect(url_for("home"))
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get("is_admin"):
            return redirect(url_for("home"))
        return f(*args, **kwargs)
    return decorated

# ── Public Routes ─────────────────────────────────────────────────────────────
@app.route("/")
def home():
    db = get_db()
    # 1. Latest cars (your existing logic)
    cars = db.execute(
        "SELECT c.*, ci.filename as main_image FROM cars c "
        "LEFT JOIN car_images ci ON c.id = ci.car_id AND ci.is_main = 1 "
        "WHERE c.status = 'confirmed' ORDER BY c.created_at DESC LIMIT 8"
    ).fetchall()
    
    # 2. Most Wanted (Top 10 by views)
    most_wanted = db.execute(
        "SELECT c.*, ci.filename as main_image FROM cars c "
        "LEFT JOIN car_images ci ON c.id = ci.car_id AND ci.is_main = 1 "
        "WHERE c.status = 'confirmed' ORDER BY c.views DESC LIMIT 10"
    ).fetchall()

    # 3. Blogs (your existing logic)
    blogs = db.execute(
        "SELECT * FROM blogs ORDER BY created_at DESC LIMIT 4"
    ).fetchall()
    
    return render_template("home.html", cars=cars, most_wanted=most_wanted, blogs=blogs)

@app.route("/vehicles")
def vehicles():
    import re as _re
    page      = request.args.get('page', 1, type=int)
    per_page  = 20
    offset    = (page - 1) * per_page

    # ── Read all filter params once ──────────────────────────────────────────
    search     = request.args.get('search', '').strip()
    marka      = request.args.get('marka', '').strip()
    modeli     = request.args.get('modeli', '').strip()
    kambio     = request.args.get('kambio', '').strip()
    karburanti = request.args.get('karburanti', '').strip()
    price_from = request.args.get('price_from', '').strip()
    price_to   = request.args.get('price_to', '').strip()
    location   = request.args.get('location', '').strip()
    km_range   = request.args.get('km_range', '').strip()
    year_range = request.args.get('year_range', '').strip()
    forma      = request.args.get('forma', '').strip()

    db = get_db()

    # ── Build WHERE clause ───────────────────────────────────────────────────
    where  = ["c.status = 'confirmed'"]
    params = []

    if search:
        where.append("(c.marka LIKE ? OR c.modeli LIKE ? OR c.description LIKE ?)")
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
    if marka:
        where.append("c.marka = ?");  params.append(marka)
    if modeli:
        where.append("c.modeli = ?"); params.append(modeli)
    if kambio:
        where.append("c.kambio = ?"); params.append(kambio)
    if karburanti:
        where.append("c.karburant = ?"); params.append(karburanti)
    if forma:
        where.append("c.forma = ?"); params.append(forma)
    if location:
        where.append("c.location = ?"); params.append(location)
    if price_from:
        try:
            where.append("c.cmimi >= ?"); params.append(float(price_from))
        except ValueError: pass
    if price_to:
        try:
            where.append("c.cmimi <= ?"); params.append(float(price_to))
        except ValueError: pass

    # Year / generation filter
    # year_range is either a plain year ("2008") or a generation label ("8P 2003-2012")
    if year_range:
        years_found = _re.findall(r'\b(1\d{3}|2\d{3})\b', year_range)
        if len(years_found) >= 2:
            where.append("CAST(c.viti AS INTEGER) BETWEEN ? AND ?")
            params.extend([int(years_found[0]), int(years_found[-1])])
        elif len(years_found) == 1:
            where.append("CAST(c.viti AS INTEGER) = ?")
            params.append(int(years_found[0]))

    # KM range filter
    if km_range:
        try:
            if km_range.endswith('+'):
                where.append("c.km >= ?"); params.append(250000)
            else:
                parts = km_range.split('-')
                where.append("c.km BETWEEN ? AND ?")
                params.extend([int(parts[0]), int(parts[1])])
        except (ValueError, IndexError):
            pass

    where_sql = " AND ".join(where)

    # ── Count total (same params, no LIMIT) ──────────────────────────────────
    total_cars = db.execute(
        f"SELECT COUNT(*) FROM cars c WHERE {where_sql}", params
    ).fetchone()[0]
    total_pages = (total_cars + per_page - 1) // per_page

    # ── Fetch page ────────────────────────────────────────────────────────────
    cars = db.execute(
        f"SELECT c.*, (SELECT filename FROM car_images WHERE car_id = c.id AND is_main = 1 LIMIT 1) as main_image "
        f"FROM cars c WHERE {where_sql} ORDER BY c.created_at DESC LIMIT ? OFFSET ?",
        params + [per_page, offset]
    ).fetchall()

    return render_template('vehicles.html',
        cars=cars, total=total_cars, page=page, per_page=per_page,
        total_pages=total_pages,
        search=search, marka=marka, modeli=modeli, kambio=kambio,
        karburanti=karburanti, price_from=price_from, price_to=price_to,
        location=location, km_range=km_range, year_range=year_range, forma=forma
    )

@app.route("/vehicle/<int:car_id>")
def vehicle_details(car_id):
    db = get_db()
    car = db.execute(
        "SELECT c.*, u.first_name, u.last_name FROM cars c "
        "JOIN users u ON c.user_id = u.id WHERE c.id = ? AND c.status = 'confirmed'",
        (car_id,)
    ).fetchone()
    
    if not car:
        return render_template("404.html"), 404

    # --- Unique Click per Device Logic ---
    cookie_name = f"v_{car_id}"
    has_viewed = request.cookies.get(cookie_name)
    
    images = db.execute("SELECT filename FROM car_images WHERE car_id = ?", (car_id,)).fetchall()
    similar = db.execute(
        "SELECT c.*, ci.filename as main_image FROM cars c "
        "LEFT JOIN car_images ci ON c.id = ci.car_id AND ci.is_main = 1 "
        "WHERE c.status = 'confirmed' AND c.marka = ? AND c.id != ? LIMIT 4",
        (car["marka"], car_id)
    ).fetchall()

    # Create response so we can set the cookie if it's a new view
    resp = make_response(render_template("vehicle-details.html", car=car, images=images, similar=similar))
    
    if not has_viewed:
        db.execute("UPDATE cars SET views = views + 1 WHERE id = ?", (car_id,))
        db.commit()
        # Set cookie for 1 week (604800 seconds) to prevent spamming views
        resp.set_cookie(cookie_name, "1", max_age=604800)
    
    return resp

@app.route("/blog")
def blog():
    db = get_db()
    blogs = db.execute("SELECT * FROM blogs ORDER BY created_at DESC").fetchall()
    return render_template("blog.html", blogs=blogs)

@app.route("/blog/<int:blog_id>")
def blog_post(blog_id):
    db = get_db()
    post = db.execute("SELECT * FROM blogs WHERE id = ?", (blog_id,)).fetchone()
    if not post:
        return redirect(url_for("blog"))
    return render_template("blog-post.html", post=post)

@app.route("/about")
def about():
    return render_template("about-us.html")

@app.route("/contact", methods=["GET", "POST"])
def contact():
    if request.method == "POST":
        db = get_db()
        db.execute(
            "INSERT INTO contacts (name, email, subject, message) VALUES (?,?,?,?)",
            (request.form["name"], request.form["email"],
             request.form.get("subject"), request.form["message"])
        )
        db.commit()
        flash("Mesazhi u dërgua me sukses!", "success")
        return redirect(url_for("contact"))
    return render_template("contact-us.html")

# ── Auth ──────────────────────────────────────────────────────────────────────
@app.route("/register", methods=["POST"])
def register():
    db = get_db()
    first = request.form["first_name"].strip()
    last  = request.form["last_name"].strip()
    email = request.form["email"].strip().lower()
    password = request.form["password"]

    if db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone():
        flash("Ky email është i regjistruar tashmë.", "error")
        return redirect(url_for("home"))

    db.execute(
        "INSERT INTO users (first_name, last_name, email, password) VALUES (?,?,?,?)",
        (first, last, email, generate_password_hash(password))
    )
    db.commit()
    user = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    session["user_id"] = user["id"]
    session["user_name"] = f"{user['first_name']} {user['last_name']}"
    session["is_admin"] = bool(user["is_admin"])
    flash("Llogaria u krijua me sukses!", "success")
    return redirect(url_for("home"))

@app.route("/login", methods=["POST"])
def login():
    db = get_db()
    email    = request.form["email"].strip().lower()
    password = request.form["password"]
    user = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()

    if not user or not user["password"] or not check_password_hash(user["password"], password):
        flash("Email ose fjalëkalimi i gabuar.", "error")
        return redirect(url_for("home"))

    session.permanent = True
    session["user_id"] = user["id"]
    session["user_name"] = f"{user['first_name']} {user['last_name']}"
    session["is_admin"] = bool(user["is_admin"])
    return redirect(url_for("home"))

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("home"))

@app.route("/login/google")
def google_login():
    redirect_uri = url_for('google_callback', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route("/login/google/callback")
def google_callback():
    # 1. Get the token and user info
    token = google.authorize_access_token()
    user_info = token.get("userinfo")
    
    db = get_db()
    # 2. Check for existing user by Google ID or Email
    user = db.execute(
        "SELECT * FROM users WHERE google_id = ? OR email = ?",
        (user_info["sub"], user_info["email"])
    ).fetchone()

    if not user:
        # 3. Create new user if they don't exist
        db.execute(
            "INSERT INTO users (first_name, last_name, email, google_id, is_admin) VALUES (?,?,?,?,?)",
            (user_info.get("given_name", ""), user_info.get("family_name", ""),
             user_info["email"], user_info["sub"], 0) # Default is_admin to 0
        )
        db.commit()
        # Refetch the new user to get their auto-incremented ID
        user = db.execute("SELECT * FROM users WHERE google_id = ?", (user_info["sub"],)).fetchone()
        
    elif not user["google_id"]:
        # 4. Link Google account to an existing email-only account
        db.execute("UPDATE users SET google_id = ? WHERE id = ?", (user_info["sub"], user["id"]))
        db.commit()
        # Refresh the user variable to include the new google_id
        user = db.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()

    session.permanent = True
    # 5. Set session variables used in base.html
    session["user_id"] = user["id"]
    # We combine names for the header display
    session["user_name"] = f"{user['first_name']} {user['last_name']}".strip()
    session["is_admin"] = bool(user["is_admin"])
    
    flash(f"Mirëseerdhe, {user['first_name']}!", "success")
    return redirect(url_for("home"))

# ── Car Posting ───────────────────────────────────────────────────────────────
@app.route("/add-car", methods=["GET", "POST"])
@login_required
def add_car():
    if request.method == "POST":
        db = get_db()
        price = float(request.form["price"])
        
        cur = db.execute(
            """INSERT INTO cars (user_id, marka, modeli, viti, generazione, cmimi, currency, 
               karburant, kambio, forma, km, description, location, contact_name, phone) 
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (session["user_id"], request.form["marka"], request.form["modeli"],
             int(request.form.get("viti") or 0) or None,   # exact year as integer
             request.form.get("generazione") or None,       # generation label e.g. "8P 2003-2012"
             price, request.form.get("currency", "EUR"),
             request.form.get("karburant"), request.form.get("kambio"),
             request.form.get("forma"), request.form.get("km") or None,
             request.form.get("description"), request.form.get("location"),
             request.form.get("contact_name"), request.form.get("phone"))
        )
        car_id = cur.lastrowid
        db.commit()

        files = request.files.getlist("photos")
        for i, f in enumerate(files):
            if f and allowed_file(f.filename):
                filename = secure_filename(f"{car_id}_{i}_{f.filename}")
                f.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
                db.execute(
                    "INSERT INTO car_images (car_id, filename, is_main) VALUES (?,?,?)",
                    (car_id, filename, 1 if i == 0 else 0)
                )
        db.commit()
        flash("Mjeti u dërgua për rishikim!", "success")
        return redirect(url_for("profile"))

    return render_template("add-car.html")

# ── Profile ───────────────────────────────────────────────────────────────────
@app.route("/profile", methods=["GET", "POST"])
@login_required
def profile():
    db = get_db()
    if request.method == "POST":
        db.execute(
            "UPDATE users SET first_name=?, last_name=?, email=? WHERE id=?",
            (request.form["first_name"], request.form["last_name"],
             request.form["email"], session["user_id"])
        )
        db.commit()
        session["user_name"] = f"{request.form['first_name']} {request.form['last_name']}"
        flash("Ndryshimet u ruajtën.", "success")

    user = db.execute("SELECT * FROM users WHERE id = ?", (session["user_id"],)).fetchone()
    cars = db.execute(
        "SELECT c.*, ci.filename as main_image FROM cars c "
        "LEFT JOIN car_images ci ON c.id = ci.car_id AND ci.is_main = 1 "
        "WHERE c.user_id = ? ORDER BY c.created_at DESC",
        (session["user_id"],)
    ).fetchall()
    return render_template("profile.html", user=user, cars=cars)

@app.route("/car/delete/<int:car_id>", methods=["POST"])
@login_required
def delete_car(car_id):
    db = get_db()
    car = db.execute("SELECT * FROM cars WHERE id = ? AND user_id = ?",
                     (car_id, session["user_id"])).fetchone()
    if car:
        db.execute("DELETE FROM car_images WHERE car_id = ?", (car_id,))
        db.execute("DELETE FROM cars WHERE id = ?", (car_id,))
        db.commit()
    return redirect(url_for("profile"))

# ── Admin ─────────────────────────────────────────────────────────────────────
@app.route("/admin")
@admin_required
def admin():
    db = get_db()
    pending = db.execute(
        "SELECT c.*, u.first_name, u.last_name FROM cars c "
        "JOIN users u ON c.user_id = u.id WHERE c.status = 'pending' ORDER BY c.created_at DESC"
    ).fetchall()
    blogs  = db.execute("SELECT * FROM blogs ORDER BY created_at DESC").fetchall()
    stats  = {
        "pending": db.execute("SELECT COUNT(*) FROM cars WHERE status='pending'").fetchone()[0],
        "total_blogs": db.execute("SELECT COUNT(*) FROM blogs").fetchone()[0],
        "total_cars": db.execute("SELECT COUNT(*) FROM cars WHERE status='confirmed'").fetchone()[0],
        "total_users": db.execute("SELECT COUNT(*) FROM users").fetchone()[0],
    }
    return render_template("admin.html", pending=pending, blogs=blogs, stats=stats)

@app.route("/admin/car/<int:car_id>/<action>", methods=["POST"])
@admin_required
def admin_car_action(car_id, action):
    db = get_db()
    if action == "confirm":
        db.execute("UPDATE cars SET status='confirmed' WHERE id=?", (car_id,))
    elif action == "decline":
        db.execute("UPDATE cars SET status='declined' WHERE id=?", (car_id,))
    elif action == "delete":
        db.execute("DELETE FROM car_images WHERE car_id=?", (car_id,))
        db.execute("DELETE FROM cars WHERE id=?", (car_id,))
    db.commit()
    return redirect(url_for("admin"))

@app.route("/admin/blog/add", methods=["POST"])
@admin_required
def admin_blog_add():
    db = get_db()
    image_filename = None
    f = request.files.get("image")
    if f and allowed_file(f.filename):
        image_filename = secure_filename(f"blog_{f.filename}")
        f.save(os.path.join(app.config["UPLOAD_FOLDER"], image_filename))

    db.execute(
        "INSERT INTO blogs (title, category, content, image, author_id) VALUES (?,?,?,?,?)",
        (request.form["title"], request.form.get("category"),
         request.form["content"], image_filename, session["user_id"])
    )
    db.commit()
    return redirect(url_for("admin"))

@app.route("/admin/blog/delete/<int:blog_id>", methods=["POST"])
@admin_required
def admin_blog_delete(blog_id):
    get_db().execute("DELETE FROM blogs WHERE id=?", (blog_id,))
    get_db().commit()
    return redirect(url_for("admin"))

@app.route("/robots.txt")
def robots_txt():
    lines = [
        "User-agent: *",
        "Disallow: /admin",
        "Disallow: /profile",
        "Disallow: /add-car",
        "Disallow: /login",
        "Disallow: /login/google",
        "Disallow: /login/google/callback",
        "",
        "Sitemap: https://kerkoauto.com/sitemap.xml"
    ]
    return Response("\n".join(lines), mimetype="text/plain")

@app.route("/sitemap.xml")
def sitemap_xml():
    db = get_db()
    cars  = db.execute("SELECT id, created_at FROM cars WHERE status='confirmed' ORDER BY created_at DESC").fetchall()
    blogs = db.execute("SELECT id, created_at FROM blogs ORDER BY created_at DESC").fetchall()

    static_pages = [
        ("https://kerkoauto.com/",        "daily",   "1.0"),
        ("https://kerkoauto.com/vehicles", "hourly",  "0.9"),
        ("https://kerkoauto.com/blog",     "weekly",  "0.7"),
        ("https://kerkoauto.com/about",    "monthly", "0.5"),
        ("https://kerkoauto.com/contact",  "monthly", "0.4"),
    ]

    xml = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url, freq, priority in static_pages:
        xml.append(f"  <url><loc>{url}</loc><changefreq>{freq}</changefreq><priority>{priority}</priority></url>")
    for car in cars:
        xml.append(f'  <url><loc>https://kerkoauto.com/vehicle/{car["id"]}</loc><lastmod>{car["created_at"][:10]}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>')
    for blog in blogs:
        xml.append(f'  <url><loc>https://kerkoauto.com/blog/{blog["id"]}</loc><lastmod>{blog["created_at"][:10]}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>')
    xml.append("</urlset>")

    return Response("\n".join(xml), mimetype="application/xml")

@app.errorhandler(404)
def not_found(e):
    return render_template("404.html"), 404

@app.errorhandler(500)
def server_error(e):
    return render_template("500.html"), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    migrate_db()
    app.run(debug=True, host='0.0.0.0', port=5000)