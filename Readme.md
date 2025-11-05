# 🧩 Mock API Utility (Responder)

A lightweight full-stack app built with **React**, **Tailwind CSS**, and an **in-memory SQLite** backend.
It lets users create, manage, and test mock API endpoints — with options to mark them as **Public** or **Private** (secured via API key) — all easily deployable through **Docker**.

---

## 🚀 Highlights

* 🛠️ Create mock endpoints with custom JSON responses
* ✏️ Edit, update, or delete existing mocks
* 🔒 Toggle endpoints between **public/private**
* 🔑 Private APIs require `x-api-key` in headers
* 👤 Default login credentials included for quick access
* 🧠 In-memory SQLite database — no setup required
* 🐳 Fully Dockerized — one command to build and run
* 🎨 Modern UI powered by **React + TailwindCSS**

---

## 👤 Default Credentials

Use the following credentials to log in:

| Field                | Value               |
| -------------------- | ------------------- |
| **Username / Email** | `admin@example.com` |
| **Password**         | `admin123`          |

> These credentials can be used directly.

---

## ⚙️ Environment Configuration

A `.env` file is already present in the **project root** (same level as `docker-compose.yml`):

```bash
# To Create JWT
JWT_SECRET=Some@KeyHere

# API PORT
PORT=4000

# Frontend URL (CORS origin)
CORS_ORIGINS=http://localhost:5173
```

**Explanation**

* `JWT_SECRET` → Used for signing and verifying JSON Web Tokens
* `PORT` → Backend server port (default: 4000)
* `CORS_ORIGINS` → Allowed origin for frontend requests (React app)

---

## 🐳 Run with Docker

### 1️⃣ Build and start containers

```bash
docker compose up --build
```

This will:

* Build backend and frontend Docker images
* Initialize the SQLite database
* Start both services in production mode

### 2️⃣ Access the app

| Service      | URL                                            |
| ------------ | ---------------------------------------------- |
| **Frontend** | [http://localhost:5173](http://localhost:5173) |
| **Backend**  | [http://localhost:4000](http://localhost:4000) |

---

### 🧹 Stop and Remove Containers

To stop all running containers and clean up resources created by Docker Compose:

```bash
docker compose down
```

This will remove:

* Running containers
* Associated networks
* Temporary volumes (if not named)

If you also want to remove volumes and images:

```bash
docker compose down --rmi all --volumes
```

---

## 📦 Docker Compose Summary

```yaml
version: "3.9"
services:
  backend:
    build: ./backend
    env_file:
      - ./.env
    environment:
      - PORT=4000
      - NODE_ENV=production
    ports:
      - "4000:4000"
    volumes:
      - responder_data:/app
    command: >
      sh -c "node db.js --init && node server.js"
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=http://backend:4000
    environment:
      - NODE_ENV=production
    depends_on:
      - backend
    ports:
      - "5173:80"
    restart: unless-stopped

volumes:
  responder_data:
```

> 💾 **Persistent Data:**
> The backend uses a named Docker volume called **`responder_data`** to store in-memory SQLite data persistently across container restarts.

---

## 💬 Feel free to raise a PR

## 🎉 Have fun!

[![Watch the video](https://img.youtube.com/vi/_5tFXJQIzi4/0.jpg)](https://www.youtube.com/watch?v=_5tFXJQIzi4)
