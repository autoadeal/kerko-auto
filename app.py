import os
import sqlite3
import uuid
from datetime import datetime
from functools import wraps
from flask import ( Flask, render_template, request, redirect, url_for, session, flash, send_from_directory, abort, g, make_response )
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
from urllib.parse import urlencode
import requests
from werkzeug.middleware.proxy_fix import ProxyFix
from whitenoise import WhiteNoise


# APP CONFIG

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def load_local_env(path):
    """Load simple KEY=value pairs from the local credentials file."""
    if not os.path.isfile(path):
        return
    with open(path, encoding="utf-8") as env_file:
        for line in env_file:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())

load_local_env(os.path.join(BASE_DIR, "env"))

app = Flask(__name__)
RAILWAY_DOMAIN = os.environ.get("RAILWAY_PUBLIC_DOMAIN", "").strip()
IS_PRODUCTION = bool(RAILWAY_DOMAIN or os.environ.get("RAILWAY_ENVIRONMENT"))

secret_key = os.environ.get("SECRET_KEY", "").strip()
if IS_PRODUCTION and not secret_key:
    raise RuntimeError("SECRET_KEY must be configured in Railway Variables.")
app.secret_key = secret_key or secrets.token_hex(32)

app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SECURE"] = IS_PRODUCTION
app.config["PERMANENT_SESSION_LIFETIME"] = 7200
app.config["MAX_CONTENT_LENGTH"] = 48 * 1024 * 1024

app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)
app.wsgi_app = WhiteNoise(
    app.wsgi_app,
    root=os.path.join(BASE_DIR, "static"),
    prefix="static/",
)

VOLUME_DIR = os.environ.get("RAILWAY_VOLUME_MOUNT_PATH", "").strip()
DATABASE = os.path.join(VOLUME_DIR or BASE_DIR, "kerkoauto.db")
UPLOAD_FOLDER = os.path.join(VOLUME_DIR, "uploads") if VOLUME_DIR else os.path.join(BASE_DIR, "static/images/uploads")
ALLOWED_EXT    = {"png", "jpg", "jpeg", "webp"}
MAX_PHOTOS     = 6
GOOGLE_CLIENT_ID     = os.environ.get("GOOGLE_CLIENT_ID", "YOUR_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "YOUR_CLIENT_SECRET")
GOOGLE_AUTH_ENABLED  = bool(
    GOOGLE_CLIENT_ID not in {"", "YOUR_CLIENT_ID"}
    and GOOGLE_CLIENT_SECRET not in {"", "YOUR_CLIENT_SECRET"}
)
SITE_URL = os.environ.get("SITE_URL", "").strip() or (f"https://{RAILWAY_DOMAIN}" if RAILWAY_DOMAIN else "http://localhost:5000")
SITE_URL = SITE_URL.rstrip("/")
GOOGLE_REDIRECT_URI  = os.environ.get("GOOGLE_REDIRECT_URI", f"{SITE_URL}/auth/google/callback")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# DATABASE HELPERS

def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE, timeout=30)
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA journal_mode=WAL")
        db.execute("PRAGMA foreign_keys=ON")
    return db

@app.teardown_appcontext
def close_db(exc):
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()

def query_db(sql, args=(), one=False):
    cur = get_db().execute(sql, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

def execute_db(sql, args=()):
    db = get_db()
    cur = db.execute(sql, args)
    db.commit()
    return cur.lastrowid


# DATABASE INIT  (run once on first start)

def init_db():
    db = sqlite3.connect(DATABASE, timeout=30)
    db.executescript("""
        PRAGMA journal_mode=WAL;
        PRAGMA foreign_keys=ON;

        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name  TEXT    NOT NULL,
            last_name   TEXT    NOT NULL DEFAULT '',
            email       TEXT    NOT NULL UNIQUE,
            password    TEXT    NOT NULL DEFAULT '',
            google_id   TEXT    UNIQUE,
            avatar      TEXT,
            phone       TEXT,
            city        TEXT,
            instagram   TEXT,
            facebook    TEXT,
            tiktok      TEXT,
            is_verified INTEGER NOT NULL DEFAULT 0,
            is_admin    INTEGER NOT NULL DEFAULT 0,
            created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS cars (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
            marka        TEXT,
            modeli       TEXT,
            viti         INTEGER,
            karburant    TEXT,
            kambio       TEXT,
            forma        TEXT,
            km           INTEGER,
            cmimi        REAL,
            currency     TEXT    DEFAULT 'EUR',
            location     TEXT,
            description  TEXT,
            contact_name TEXT,
            phone        TEXT,
            generazione  TEXT,
            status       TEXT    NOT NULL DEFAULT 'pending',
            views        INTEGER NOT NULL DEFAULT 0,
            created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS car_images (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            car_id     INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
            filename   TEXT    NOT NULL
        );

        CREATE TABLE IF NOT EXISTS blogs (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            title      TEXT NOT NULL,
            content    TEXT NOT NULL,
            category   TEXT,
            image      TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        DELETE FROM car_images
        WHERE NOT EXISTS (SELECT 1 FROM cars WHERE cars.id = car_images.car_id);

    """)
    db.commit()
    db.close()
    print("Database schema ready.")


# Gunicorn imports this module instead of running the development entry point.
# Keep schema creation idempotent so a fresh Railway volume is ready immediately.
init_db()


# HELPERS

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXT

def optional_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None

def save_upload(file):
    """Save an uploaded image and return the stored filename."""
    ext      = file.filename.rsplit(".", 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    file.save(os.path.join(UPLOAD_FOLDER, filename))
    return filename

def remove_upload(filename):
    """Remove one generated upload without allowing paths outside the upload folder."""
    if not filename:
        return
    path = os.path.join(UPLOAD_FOLDER, os.path.basename(filename))
    if os.path.isfile(path):
        os.remove(path)

def delete_car_and_uploads(car_id):
    """Delete a car and its uploaded files after the database deletion succeeds."""
    images = query_db("SELECT filename FROM car_images WHERE car_id=?", (car_id,))
    execute_db("DELETE FROM cars WHERE id=?", (car_id,))
    for image in images:
        remove_upload(image["filename"])

def csrf_token():
    token = session.get("_csrf_token")
    if not token:
        token = secrets.token_urlsafe(32)
        session["_csrf_token"] = token
    return token

app.jinja_env.globals["csrf_token"] = csrf_token
app.jinja_env.globals["google_auth_enabled"] = GOOGLE_AUTH_ENABLED

@app.before_request
def protect_post_requests():
    if request.method != "POST":
        return None
    expected = session.get("_csrf_token", "")
    submitted = request.form.get("csrf_token", "") or request.headers.get("X-CSRF-Token", "")
    if not expected or not secrets.compare_digest(expected, submitted):
        abort(400)
    return None

@app.after_request
def add_security_headers(response):
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "SAMEORIGIN")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    if IS_PRODUCTION:
        response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    return response

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get("user_id"):
            flash("Ju lutem hyni në llogarinë tuaj.", "warning")
            return redirect(url_for("home"))
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get("is_admin"):
            abort(403)
        return f(*args, **kwargs)
    return decorated


# STATIC FILE SERVING FOR UPLOADS
@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


# AUTH
@app.route("/register", methods=["POST"])
def register():
    first = request.form.get("first_name", "").strip()
    last  = request.form.get("last_name",  "").strip()
    email = request.form.get("email",      "").strip().lower()
    pw    = request.form.get("password",   "")

    if not all([first, last, email, pw]):
        flash("Plotëso të gjitha fushat.", "danger")
        return redirect(url_for("home"))

    existing = query_db("SELECT id FROM users WHERE email=?", (email,), one=True)
    if existing:
        flash("Ky email është tashmë i regjistruar.", "danger")
        return redirect(url_for("home"))

    uid = execute_db(
        "INSERT INTO users (first_name,last_name,email,password) VALUES (?,?,?,?)",
        (first, last, email, generate_password_hash(pw))
    )
    session["user_id"]   = uid
    session["user_name"] = first
    session["is_admin"]  = False
    flash(f"Mirë se erdhe, {first}!", "success")
    return redirect(url_for("home"))

@app.route("/login", methods=["POST"])
def login():
    email = request.form.get("email", "").strip().lower()
    pw    = request.form.get("password", "")
    user  = query_db("SELECT * FROM users WHERE email=?", (email,), one=True)

    if user and check_password_hash(user["password"], pw):
        session["user_id"]   = user["id"]
        session["user_name"] = user["first_name"]
        session["is_admin"]  = bool(user["is_admin"])
        flash(f"Mirë se erdhe, {user['first_name']}!", "success")
    else:
        flash("Email ose fjalëkalim i gabuar.", "danger")
    return redirect(request.referrer or url_for("home"))

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("home"))

@app.route("/auth/google")
def google_login():
    if not GOOGLE_AUTH_ENABLED:
        flash("Hyrja me Google nuk është konfiguruar ende.", "warning")
        return redirect(url_for("home"))
    state = secrets.token_urlsafe(16)
    session.permanent = True
    session["oauth_state"] = state
    params = {
        "client_id":     GOOGLE_CLIENT_ID,
        "redirect_uri":  GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope":         "openid email profile",
        "state":         state,
        "prompt":        "select_account",
    }
    return redirect(f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}")


@app.route("/auth/google/callback")
def google_callback():
    if not GOOGLE_AUTH_ENABLED:
        flash("Hyrja me Google nuk është konfiguruar ende.", "warning")
        return redirect(url_for("home"))
    if request.args.get("state") != session.pop("oauth_state", None):
        flash("Gabim sigurie. Provoni përsëri.", "danger")
        return redirect(url_for("home"))

    code = request.args.get("code")
    if not code:
        flash("Hyrja me Google dështoi.", "danger")
        return redirect(url_for("home"))

    try:
        token_response = requests.post("https://oauth2.googleapis.com/token", data={
            "code": code, "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI, "grant_type": "authorization_code",
        }, timeout=10)
        token_response.raise_for_status()
        token = token_response.json()
        info_response = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token['access_token']}"}, timeout=10
        )
        info_response.raise_for_status()
        info = info_response.json()
    except (requests.RequestException, ValueError, KeyError):
        flash("Hyrja me Google dështoi.", "danger")
        return redirect(url_for("home"))

    google_id = info.get("sub")
    email     = info.get("email", "").lower()
    first     = info.get("given_name", info.get("name", "User"))
    last      = info.get("family_name", "")
    avatar    = info.get("picture", "")

    if not google_id or not email:
        flash("Google nuk ktheu të dhënat e nevojshme të llogarisë.", "danger")
        return redirect(url_for("home"))

    user = query_db("SELECT * FROM users WHERE google_id=?", (google_id,), one=True)
    if not user:
        user = query_db("SELECT * FROM users WHERE email=?", (email,), one=True)
        if user:
            execute_db("UPDATE users SET google_id=?,avatar=? WHERE id=?",
                       (google_id, avatar, user["id"]))
            user = query_db("SELECT * FROM users WHERE id=?", (user["id"],), one=True)
        else:
            uid  = execute_db(
                "INSERT INTO users (first_name,last_name,email,google_id,avatar) VALUES (?,?,?,?,?)",
                (first, last, email, google_id, avatar))
            user = query_db("SELECT * FROM users WHERE id=?", (uid,), one=True)

    session.update({"user_id": user["id"], "user_name": user["first_name"],
                    "is_admin": bool(user["is_admin"])})
    flash(f"Mirë se erdhe, {user['first_name']}!", "success")
    return redirect(url_for("home"))


# PUBLIC ROUTES

@app.route("/health")
def health():
    query_db("SELECT 1", one=True)
    return {"status": "ok"}

@app.route("/")
def home():
    most_wanted = query_db(
        """SELECT cars.*, ci.filename AS main_image
           FROM cars
           LEFT JOIN (SELECT car_id, MIN(id) AS min_id FROM car_images GROUP BY car_id) first
               ON cars.id = first.car_id
           LEFT JOIN car_images ci ON ci.id = first.min_id
           WHERE cars.status='confirmed' ORDER BY views DESC LIMIT 10"""
    )
    blogs = query_db(
        "SELECT * FROM blogs ORDER BY created_at DESC LIMIT 4"
    )
    return render_template("home.html", most_wanted=most_wanted, blogs=blogs)

@app.route("/vehicles")
def vehicles():
    marka      = request.args.get("marka",      "").strip()
    modeli     = request.args.get("modeli",     "").strip()
    year_range = request.args.get("year_range", "").strip()
    kambio     = request.args.get("kambio",     "").strip()
    karburanti = request.args.get("karburanti", "").strip()
    price_from = request.args.get("price_from", "").strip()
    price_to   = request.args.get("price_to",   "").strip()
    location   = request.args.get("location",   "").strip()
    km_range   = request.args.get("km_range",   "").strip()
    forma      = request.args.get("forma",      "").strip()
    lloji      = request.args.get("lloji",      "").strip() 
    search     = request.args.get("search",     "").strip()

    sql    = """SELECT cars.*, ci.filename AS main_image
               FROM cars
               LEFT JOIN (SELECT car_id, MIN(id) AS min_id FROM car_images GROUP BY car_id) first
                   ON cars.id = first.car_id
               LEFT JOIN car_images ci ON ci.id = first.min_id
               WHERE cars.status='confirmed'"""
    params = []

    if marka:
        sql += " AND marka=?";       params.append(marka)
    if modeli:
        sql += " AND modeli=?";      params.append(modeli)
    if kambio:
        sql += " AND kambio=?";      params.append(kambio)
    if karburanti:
        sql += " AND karburant=?";   params.append(karburanti)
    if location:
        sql += " AND location=?";    params.append(location)
    if forma or lloji:
        sql += " AND forma=?";       params.append(forma or lloji)
    price_from_value = optional_float(price_from)
    price_to_value = optional_float(price_to)
    if price_from_value is not None:
        sql += " AND cmimi>=?";      params.append(price_from_value)
    if price_to_value is not None:
        sql += " AND cmimi<=?";      params.append(price_to_value)
    if search:
        sql += " AND (marka LIKE ? OR modeli LIKE ? OR description LIKE ?)";
        like = f"%{search}%"
        params += [like, like, like]

    if year_range:
        import re
        years = re.findall(r'\b(\d{4})\b', year_range)
        if len(years) >= 2:
            sql += " AND viti>=? AND viti<=?"; params += [int(years[0]), int(years[-1])]
        elif len(years) == 1:
            sql += " AND viti=?"; params.append(int(years[0]))

    if km_range:
        if km_range.endswith("+"):
            km_from = optional_float(km_range[:-1])
            if km_from is not None:
                sql += " AND km>=?"; params.append(int(km_from))
        else:
            parts = km_range.split("-")
            if len(parts) == 2:
                km_from = optional_float(parts[0])
                km_to = optional_float(parts[1])
                if km_from is not None and km_to is not None:
                    sql += " AND km>=? AND km<=?"; params += [int(km_from), int(km_to)]

    sql   += " ORDER BY created_at DESC"
    cars   = query_db(sql, params)
    total  = len(cars)

    return render_template("vehicles.html",
        cars=cars, total=total,
        marka=marka, modeli=modeli, year_range=year_range,
        kambio=kambio, karburanti=karburanti,
        price_from=price_from, price_to=price_to,
        location=location, km_range=km_range,
        forma=forma, search=search
    )

@app.route("/vehicles/<int:car_id>")
def vehicle_details(car_id):
    car = query_db("SELECT * FROM cars WHERE id=? AND status='confirmed'", (car_id,), one=True)
    if not car:
        abort(404)
    execute_db("UPDATE cars SET views=views+1 WHERE id=?", (car_id,))
    images  = query_db("SELECT * FROM car_images WHERE car_id=?", (car_id,))
    similar = query_db(
        """SELECT cars.*, ci.filename AS main_image
        FROM cars
        LEFT JOIN (SELECT car_id, MIN(id) AS min_id FROM car_images GROUP BY car_id) first
            ON cars.id = first.car_id
        LEFT JOIN car_images ci ON ci.id = first.min_id
        WHERE cars.status='confirmed' AND cars.marka=? AND cars.id!=?
        ORDER BY cars.created_at DESC LIMIT 5""",
        (car["marka"], car_id)
    )
    return render_template("vehicle-details.html", car=car, images=images, similar=similar)

@app.route("/add-car", methods=["GET", "POST"])
@login_required
def add_car():
    if request.method == "POST":
        files = request.files.getlist("photos")[:MAX_PHOTOS]
        valid_files = [f for f in files if f and f.filename and allowed_file(f.filename)]
        if not valid_files:
            flash("Ju lutem shtoni të paktën një foto JPG, PNG ose WEBP.", "danger")
            return redirect(url_for("add_car"))

        car_id = execute_db(
            """INSERT INTO cars
               (user_id,marka,modeli,viti,karburant,kambio,forma,km,cmimi,currency,
                location,description,contact_name,phone,generazione,status)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending')""",
            (
                session["user_id"],
                request.form.get("marka"),
                request.form.get("modeli"),
                request.form.get("viti") or None,
                request.form.get("karburant"),
                request.form.get("kambio"),
                request.form.get("forma"),
                request.form.get("km") or None,
                request.form.get("price") or None,
                request.form.get("currency", "EUR"),
                request.form.get("location"),
                request.form.get("description"),
                request.form.get("contact_name"),
                request.form.get("phone"),
                request.form.get("generazione"),
            )
        )

        for f in valid_files:
            fname = save_upload(f)
            execute_db("INSERT INTO car_images (car_id,filename) VALUES (?,?)", (car_id, fname))

        flash("Mjeti u postua me sukses! Do të rishikohet nga admini.", "success")
        return redirect(url_for("profile"))

    return render_template("add-car.html")

@app.route("/vlereso")
def valuation():
    return render_template("valuation.html")

@app.route("/api/valuation-prices")
def valuation_prices():
    marka  = request.args.get("marka",  "").strip()
    modeli = request.args.get("modeli", "").strip()
    generazione = request.args.get("generazione", "").strip()

    if not marka or not modeli:
        return {"error": "missing"}, 400

    if generazione:
        rows = query_db(
            """SELECT cmimi FROM cars
               WHERE status='confirmed'
               AND marka=? AND modeli=? AND generazione=?
               AND cmimi IS NOT NULL AND cmimi > 0
               ORDER BY created_at DESC""",
            (marka, modeli, generazione)
        )
    else:
        rows = query_db(
            """SELECT cmimi FROM cars
               WHERE status='confirmed'
               AND marka=? AND modeli=?
               AND cmimi IS NOT NULL AND cmimi > 0
               ORDER BY created_at DESC""",
            (marka, modeli)
        )

    prices = sorted([r["cmimi"] for r in rows])

    if not prices:
        return {"found": False}

    count = len(prices)

    def percentile(data, pct):
        idx = (pct / 100) * (len(data) - 1)
        lower = int(idx)
        upper = min(lower + 1, len(data) - 1)
        frac  = idx - lower
        return data[lower] + frac * (data[upper] - data[lower])

    low  = round(percentile(prices, 10)) if count >= 5 else prices[0]
    high = round(percentile(prices, 90)) if count >= 5 else prices[-1]
    avg  = round(sum(prices) / count)

    return {
        "found":   True,
        "count":   count,
        "low":     low,
        "high":    high,
        "avg":     avg,
        "warning": count <= 15
    }

@app.route("/delete-car/<int:car_id>", methods=["POST"])
@login_required
def delete_car(car_id):
    car = query_db("SELECT * FROM cars WHERE id=?", (car_id,), one=True)
    if not car:
        abort(404)
    if car["user_id"] != session["user_id"] and not session.get("is_admin"):
        abort(403)
    
    delete_car_and_uploads(car_id)
    
    flash("Mjeti u fshi.", "success")
    return redirect(url_for("profile"))

@app.route("/blog")
def blog():
    blogs = query_db("SELECT * FROM blogs ORDER BY created_at DESC")
    return render_template("blog.html", blogs=blogs)


@app.route("/blog/<int:blog_id>")
def blog_post(blog_id):
    post = query_db("SELECT * FROM blogs WHERE id=?", (blog_id,), one=True)
    if not post:
        abort(404)
    return render_template("blog-post.html", post=post)

@app.route("/contact")
def contact():
    return render_template("contact-us.html")

@app.route("/about")
def about():
    return render_template("about-us.html")

@app.route("/profile", methods=["GET", "POST"])
@login_required
def profile():
    if request.method == "POST":
        user = query_db("SELECT * FROM users WHERE id=?", (session["user_id"],), one=True)
        email = request.form.get("email", "").strip().lower()
        email_owner = query_db(
            "SELECT id FROM users WHERE email=? AND id!=?", (email, session["user_id"]), one=True
        )
        if not email or email_owner:
            flash("Ky email është i pavlefshëm ose përdoret nga një llogari tjetër.", "danger")
            return redirect(url_for("profile"))
        avatar_file = request.files.get("avatar")
        avatar_filename = None
        if avatar_file and allowed_file(avatar_file.filename):
            avatar_filename = save_upload(avatar_file)

        sql = """UPDATE users SET 
                 first_name=?, last_name=?, email=?, phone=?, city=?, 
                 instagram=?, facebook=?, tiktok=?"""
        params = [
            request.form.get("first_name"), request.form.get("last_name"),
            email, request.form.get("phone"),
            request.form.get("city"), request.form.get("instagram"),
            request.form.get("facebook"), request.form.get("tiktok")
        ]

        if avatar_filename:
            sql += ", avatar=?"
            params.append(avatar_filename)
            
        sql += " WHERE id=?"
        params.append(session["user_id"])

        execute_db(sql, tuple(params))
        if avatar_filename and user["avatar"] != avatar_filename:
            remove_upload(user["avatar"])
        session["user_name"] = request.form.get("first_name")
        flash("Profili u përditësua me sukses.", "success")
        return redirect(url_for("profile"))

    user = query_db("SELECT * FROM users WHERE id=?", (session["user_id"],), one=True)
    
    cars_sql = """
        SELECT cars.*, ci.filename AS main_image
        FROM cars
        LEFT JOIN (
            SELECT car_id, MIN(id) AS min_id 
            FROM car_images 
            GROUP BY car_id
        ) first ON cars.id = first.car_id
        LEFT JOIN car_images ci ON ci.id = first.min_id
        WHERE cars.user_id=? 
        ORDER BY cars.created_at DESC
    """
    cars = query_db(cars_sql, (session["user_id"],))

    return render_template("profile.html", user=user, cars=cars)

@app.route("/seller/<int:seller_id>")
def seller_profile(seller_id):
    seller = query_db("SELECT * FROM users WHERE id=?", (seller_id,), one=True)
    if not seller:
        abort(404)
    
    cars_sql = """
        SELECT cars.*, ci.filename AS main_image
        FROM cars
        LEFT JOIN (
            SELECT car_id, MIN(id) AS min_id 
            FROM car_images 
            GROUP BY car_id
        ) first ON cars.id = first.car_id
        LEFT JOIN car_images ci ON ci.id = first.min_id
        WHERE cars.user_id=? AND cars.status='confirmed' 
        ORDER BY cars.created_at DESC
    """
    cars = query_db(cars_sql, (seller_id,))
    total_listings = len(cars)
    
    return render_template("seller.html", seller=seller, cars=cars, total_listings=total_listings)


# ADMIN ROUTES

@app.route("/admin")
@admin_required
def admin():
    pending = query_db(
        """SELECT cars.*, users.first_name, users.last_name
           FROM cars LEFT JOIN users ON cars.user_id=users.id
           WHERE cars.status='pending' ORDER BY cars.created_at DESC"""
    )
    blogs = query_db("SELECT * FROM blogs ORDER BY created_at DESC")
    users = query_db("SELECT * FROM users ORDER BY created_at DESC")
    stats = {
        "pending":     query_db("SELECT COUNT(*) FROM cars WHERE status='pending'",     one=True)[0],
        "total_blogs": query_db("SELECT COUNT(*) FROM blogs",                           one=True)[0],
        "total_cars":  query_db("SELECT COUNT(*) FROM cars WHERE status='confirmed'",   one=True)[0],
        "total_users": query_db("SELECT COUNT(*) FROM users",                           one=True)[0],
    }
    return render_template("admin.html", pending=pending, blogs=blogs, users=users, stats=stats)

@app.route("/admin/car/<int:car_id>/<action>", methods=["POST"])
@admin_required
def admin_car_action(car_id, action):
    if action == "confirm":
        execute_db("UPDATE cars SET status='confirmed' WHERE id=?", (car_id,))
        flash("Mjeti u konfirmua.", "success")
    elif action == "decline":
        execute_db("UPDATE cars SET status='declined' WHERE id=?", (car_id,))
        flash("Mjeti u refuzua.", "warning")
    elif action == "delete":
        delete_car_and_uploads(car_id)
        flash("Mjeti u fshi.", "success")
    return redirect(url_for("admin"))

@app.route("/admin/car/confirm-all", methods=["POST"])
@admin_required
def admin_car_confirm_all():
    execute_db("UPDATE cars SET status='confirmed' WHERE status='pending'")
    flash("Të gjitha kërkesat u konfirmuan.", "success")
    return redirect(url_for("admin"))

@app.route("/admin/car/edit/<int:car_id>", methods=["POST"])
@admin_required
def admin_car_edit(car_id):
    execute_db(
        "UPDATE cars SET marka=?, modeli=?, viti=?, cmimi=? WHERE id=?",
        (request.form.get("marka"), request.form.get("modeli"), request.form.get("viti"), request.form.get("cmimi"), car_id)
    )
    flash("Mjeti u përditësua.", "success")
    return redirect(url_for("admin"))

@app.route("/admin/blog/add", methods=["POST"])
@admin_required
def admin_blog_add():
    execute_db(
        "INSERT INTO blogs (title,content,category,image) VALUES (?,?,?,?)",
        (
            request.form.get("title"),
            request.form.get("content"),
            request.form.get("category") or None,
            request.form.get("image_filename") or None,
        )
    )
    flash("Artikulli u shtua.", "success")
    return redirect(url_for("admin") + "#blog")

@app.route("/admin/blog/delete/<int:blog_id>", methods=["POST"])
@admin_required
def admin_blog_delete(blog_id):
    execute_db("DELETE FROM blogs WHERE id=?", (blog_id,))
    flash("Artikulli u fshi.", "success")
    return redirect(url_for("admin") + "#blog")

@app.route("/admin/blog/edit/<int:blog_id>", methods=["POST"])
@admin_required
def admin_blog_edit(blog_id):
    execute_db(
        "UPDATE blogs SET title=?, category=?, content=? WHERE id=?",
        (request.form.get("title"), request.form.get("category"), request.form.get("content"), blog_id)
    )
    flash("Artikulli u përditësua.", "success")
    return redirect(url_for("admin"))

@app.route("/admin/user/edit/<int:user_id>", methods=["POST"])
@admin_required
def admin_user_edit(user_id):
    is_admin = 1 if request.form.get("is_admin") == "on" else 0
    is_verified = 1 if request.form.get("is_verified") == "on" else 0
    execute_db(
        "UPDATE users SET first_name=?, last_name=?, email=?, is_admin=?, is_verified=? WHERE id=?",
        (request.form.get("first_name"), request.form.get("last_name"), request.form.get("email"), is_admin, is_verified, user_id)
    )
    flash("Përdoruesi u përditësua.", "success")
    return redirect(url_for("admin"))

@app.route("/sitemap.xml")
def sitemap():
    today = datetime.utcnow().strftime("%Y-%m-%d")
    pages = [("/", "1.0", "daily"), ("/vehicles", "0.9", "daily"),
             ("/blog", "0.8", "weekly"), ("/about", "0.5", "monthly"),
             ("/contact", "0.5", "monthly")]
    cars  = query_db("SELECT id, created_at FROM cars WHERE status='confirmed'")
    blogs = query_db("SELECT id, created_at FROM blogs")

    urls = [f"<url><loc>{SITE_URL}{p}</loc><priority>{pri}</priority>"
            f"<changefreq>{freq}</changefreq></url>"
            for p, pri, freq in pages]
    urls += [f"<url><loc>{SITE_URL}/vehicles/{c['id']}</loc>"
             f"<lastmod>{c['created_at'][:10]}</lastmod><priority>0.7</priority></url>"
             for c in cars]
    urls += [f"<url><loc>{SITE_URL}/blog/{b['id']}</loc>"
             f"<lastmod>{b['created_at'][:10]}</lastmod><priority>0.6</priority></url>"
             for b in blogs]

    xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' \
          + "".join(urls) + "</urlset>"
    return make_response(xml), 200, {"Content-Type": "application/xml; charset=utf-8"}

@app.route("/robots.txt")
def robots():
    body = (f"User-agent: *\n"
            f"Disallow: /admin\n"
            f"Disallow: /profile\n"
            f"Disallow: /add-car\n"
            f"Disallow: /auth/\n"
            f"Disallow: /uploads/\n"
            f"Disallow: /vehicles?*\n"
            f"Sitemap: {SITE_URL}/sitemap.xml\n")
    return make_response(body), 200, {"Content-Type": "text/plain"}


# ERROR HANDLERS

@app.errorhandler(404)
def page_not_found(e):
    return render_template("404.html"), 404

@app.errorhandler(500)
def internal_error(e):
    return render_template("500.html"), 500


# ENTRY POINT

if __name__ == "__main__":
    app.run(
        debug=os.environ.get("FLASK_DEBUG") == "1",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "5000")),
    )
