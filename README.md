# Kerko Auto

Flask application prepared for Railway deployment with Gunicorn, a deployment health check, and persistent SQLite/upload storage through a Railway Volume.

## Deploy on Railway

1. Push this folder to a private GitHub repository and create a Railway service from it.
2. Add a Railway Volume to the service and mount it at `/data`. The application automatically uses `RAILWAY_VOLUME_MOUNT_PATH` for both `kerkoauto.db` and uploaded images.
3. Add these service variables:
   - `SECRET_KEY` — required; use a long random value.
   - `SITE_URL` — the final public URL, such as `https://kerkoauto.al`.
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` — optional; when omitted, Google sign-in is hidden.
   - `GOOGLE_REDIRECT_URI` — required when Google sign-in is enabled; normally `${SITE_URL}/auth/google/callback` with the real URL substituted.
4. Generate a public domain in Railway Networking. The configured health-check path is `/health`.
5. Add the final Google callback URL to the authorized redirect URIs in Google Cloud.

Railway detects `requirements.txt`; `railway.json` supplies the production start command and health check. A fresh volume receives the database schema automatically when Gunicorn starts.

## Existing local data

`kerkoauto.db`, `env`, `.venv`, and `static/images/uploads/` are intentionally excluded from Git. They contain local state, credentials, dependencies, or user uploads. If the existing local listings and accounts must be preserved, copy the local database and upload directory into the mounted Railway Volume before opening the production site to users.

## Local development

Create a virtual environment, install `requirements.txt`, copy `.env.example` values into the local `env` file, then run:

```text
python app.py
```
