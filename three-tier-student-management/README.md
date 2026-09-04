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
Nginx + React
   |
   v
Node.js + Express API
   |
   v
MongoDB
   |
   v
Docker named volume
```

## Stack

- React + Vite
- Nginx
- Node.js + Express
- MongoDB
- Docker / Docker Compose
- REST API
- Health checks
- Container restart policies
- Multi-stage Docker builds
- Isolated Docker networks

## Features

- Add students
- View students
- Search students
- Delete students
- API health endpoint
- Persistent MongoDB storage
- Production frontend build served by Nginx
- Backend and database are not directly exposed publicly

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

## Run on EC2

```bash
docker compose up -d --build
docker compose ps
```

Open in your browser:

```text
http://98.89.43.88
```

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
GET    /api/students
POST   /api/students
DELETE /api/students/:id
GET    /health
```

## Production notes

For a real production deployment, add HTTPS with a domain and reverse proxy, secret management, MongoDB authentication/managed MongoDB, backups, monitoring, centralized logs, resource limits, and CI/CD.
