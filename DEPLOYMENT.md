# Smartnagar Deployment Guide

Smartnagar is a full-stack app:

| Layer    | Stack                          |
|----------|--------------------------------|
| Frontend | React + Vite (port 5173 dev)   |
| Backend  | Express + MongoDB (port 5000)  |
| Auth     | HTTP-only JWT cookies          |
| Images   | Cloudinary (recommended) or local `/uploads` |

---

## Recommended: Docker Compose (single domain)

Serving frontend and API on **one domain** keeps auth cookies working (`sameSite: strict` in production).

### 1. Create environment file

Copy and edit the root env template:

```bash
cp .env.production.example .env
```

Set at minimum:

- `JWT_SECRET` — long random string
- `GEMINI_API_KEY` — for AI issue categorization
- `CLOUDINARY_*` — strongly recommended (local uploads are lost on container restart)

### 2. Build and run

```bash
docker compose up --build -d
```

Open **http://localhost** — nginx serves the React app and proxies `/api` and `/uploads` to the backend.

### 3. Production domain

Point your domain to the server and set:

```env
CLIENT_URL=https://yourdomain.com
BACKEND_URL=https://yourdomain.com
```

Put TLS in front (e.g. Caddy, Nginx, or a cloud load balancer).

---

## Cloud deployment (Render / Railway / VPS)

### Database — MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Add a database user and allow your server IP (or `0.0.0.0/0` for PaaS).
3. Copy the connection string into `MONGO_URI`.

Example:

```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/smartnagar?retryWrites=true&w=majority
```

### Backend environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Auto on PaaS | Host sets this (default `5000` locally) |
| `NODE_ENV` | Yes | Set to `production` |
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Strong secret for JWT signing |
| `CLIENT_URL` | Yes | Full frontend URL, e.g. `https://app.example.com` |
| `BACKEND_URL` | If no Cloudinary | Public API URL for local upload links |
| `CLOUDINARY_CLOUD_NAME` | Recommended | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Recommended | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Recommended | Cloudinary API secret |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |

### Frontend environment variables

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `/api` when using same-domain proxy (Docker/nginx), **or** full backend URL e.g. `https://api.example.com/api` |

Build command: `npm run build`  
Publish directory: `dist`

### Important: auth cookies

Auth uses HTTP-only cookies. For production, the app sets `secure: true` and `sameSite: strict`.

- **Same domain** (Docker nginx or reverse proxy): works out of the box.
- **Split domains** (e.g. Vercel frontend + Render backend): cookies will **not** be sent cross-site without code changes. Use one domain with a reverse proxy instead.

### Image uploads on PaaS

Render, Railway, and similar platforms use **ephemeral filesystems**. Configure Cloudinary so uploaded issue images persist.

---

## Manual VPS steps (without Docker)

1. Install Node 20+, MongoDB or use Atlas.
2. Backend:
   ```bash
   cd backend
   cp .env.example .env   # fill values
   npm ci --omit=dev
   npm start              # or use pm2
   ```
3. Frontend:
   ```bash
   cd frontend
   echo "VITE_API_URL=/api" > .env.production
   npm ci
   npm run build
   ```
4. Configure Nginx (see `frontend/nginx.conf`) to serve `dist/` and proxy `/api` to `localhost:5000`.

---

## Health check

After deploy, verify the API:

```bash
curl https://your-domain.com/api/health
```

Expected: `{"status":"ok","message":"Smartnagar API is running"}`

---

## Files added for deployment

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Full stack: MongoDB + backend + nginx frontend |
| `backend/Dockerfile` | Backend container |
| `frontend/Dockerfile` | Build React app + nginx |
| `frontend/nginx.conf` | SPA routing + API/upload proxy |
| `render.yaml` | Render.com blueprint |
| `.env.production.example` | Root env template for Docker Compose |

No application source files (`server.js`, React components, controllers, etc.) were modified.
