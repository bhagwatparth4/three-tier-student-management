# Production-Style 3-Tier Student Management System

A containerized student management application designed as a practical DevOps portfolio project.

## Architecture

```text
Internet
   |
   v
AWS EC2 :80  (98.89.43.88)
   |
   v
Nginx + React (auth, dashboard)
   |
   v
Node.js + Express API (JWT-protected)
   |
   v
MongoDB
   |
   v
Docker named volume
```

## Stack

- React + Vite + React Router
- Nginx
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication (jsonwebtoken + bcryptjs)
- Docker / Docker Compose
- REST API
- Health checks, restart policies, multi-stage builds, isolated networks

## Features

- **Sign up / Sign in** — email + password accounts, passwords hashed with bcrypt, sessions via JWT
- **Login history** — every sign-in is recorded with timestamp, IP address, and browser/device, viewable per account
- **Students** — add, search, delete; course is chosen from a fixed list of engineering programs
- **Fees** — each student has a total-fees amount; record partial/full payments and see paid vs. outstanding at a glance, plus an overall collected/outstanding summary
- All student and fee routes require a signed-in user (JWT-protected)
- API health endpoint
- Persistent MongoDB storage
- Production frontend build served by Nginx
- Backend and database are not directly exposed publicly

## Engineering courses included

Computer Science Engineering, Information Technology, Electronics & Communication Engineering,
Electrical Engineering, Mechanical Engineering, Civil Engineering, Chemical Engineering,
Aerospace Engineering, Biomedical Engineering, Artificial Intelligence & Data Science
(edit `backend/utils/courses.js` and `frontend/src/constants/courses.js` to change the list — keep both in sync).

## Known issue: MongoDB crash-loops on newer kernels (fixed here)

MongoDB 8.0+ images bundle a version of TCMalloc that crashes on startup under
Linux kernel 6.19 and newer (this is common on recently-launched EC2
instances). MongoDB tracks this as
[SERVER-121912](https://jira.mongodb.org/browse/SERVER-121912). You'll see
this in `docker logs student-mongo`:

```text
MongoDB cannot start: Linux kernel versions 6.19 and newer has a known
incompatibility with this version of MongoDB.
```

This repo's `compose.yml` works around it by setting
`GLIBC_TUNABLES=glibc.pthread.rseq=1` on the `mongo` service. No kernel
downgrade or image change needed. Remove that environment variable once
MongoDB ships a patched TCMalloc build.

## Before you run this

Set a real `JWT_SECRET` instead of the built-in dev default. Either export it
before running compose, or put it in a `.env` file next to `compose.yml`
(Docker Compose reads `.env` automatically):

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
echo "JWT_SECRET=<paste the value above>" >> .env
```

## Run on EC2

```bash
docker compose up -d --build
docker compose ps
```

Open in your browser:

```text
http://98.89.43.88
```

You'll land on the sign-up page first — create an account, then you're taken
straight to the dashboard.

## Useful commands

```bash
docker compose logs -f
docker compose logs -f backend
docker compose logs -f mongo
docker compose restart
docker compose down
docker compose down -v   # deletes MongoDB volume/data
```

## API

```text
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me                (auth required)
GET    /api/auth/login-history     (auth required)

GET    /api/students               (auth required)
POST   /api/students               (auth required)
DELETE /api/students/:id           (auth required)
POST   /api/students/:id/payments  (auth required)
GET    /api/students/courses       (auth required)

GET    /health
```

## Production notes

For a real production deployment, add HTTPS with a domain and reverse proxy, a
non-default `JWT_SECRET` and secret management generally, MongoDB
authentication/managed MongoDB, backups, monitoring, centralized logs,
resource limits, rate limiting on auth endpoints, and CI/CD.
