# SmartMemoAI

A full-stack note-taking web application with JWT-based authentication, user profiles, and avatar uploads.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, Radix UI |
| Backend | NestJS 11, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT (access + refresh token rotation) |
| Container | Docker Compose |

## Project Structure

```
SmartMemoAI/
├── frontend/         # React + Vite SPA
├── backend/          # NestJS REST API
├── docker-compose.yml
└── .gitignore
```

## Features

- **Authentication** — Register, sign in, sign out with access/refresh token rotation. The refresh token is stored in `localStorage` and silently restores sessions on page load.
- **Notes** — Create, read, update, and delete personal notes. Each note has a title and content, and belongs exclusively to the authenticated user.
- **Auto-save** — The note editor debounces changes and saves automatically, with a visible save-status indicator.
- **User profiles** — Each account has a first name, last name, bio, and an optional avatar.
- **Avatar upload** — Upload a profile image (JPEG, PNG, GIF, WebP — max 5 MB). Images are stored on disk and served as static files under `/uploads/avatars/`.
- **Role-based access** — Users have a `USER` or `ADMIN` role stored in the JWT payload.
- **Protected routes** — All app routes require authentication; unauthenticated users are redirected to `/sign-in`.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Getting Started

### 1. Start the database

```bash
docker compose up -d
```

This starts a PostgreSQL instance on port `5433` with a persistent volume.

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in your JWT secrets, then:

```bash
npm install
npx prisma migrate deploy
npm run start:dev
```

The API will be available at `http://localhost:3000`. All routes are prefixed with `/api`.

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Environment Variables

All required variables are documented in `backend/.env.example`:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `FRONTEND_URL` | Allowed CORS origin (default: `http://localhost:5173`) |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens (min 32 chars) |
| `JWT_ACCESS_EXPIRY` | Access token lifetime (e.g. `15m`) |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens (min 32 chars) |
| `JWT_REFRESH_EXPIRY` | Refresh token lifetime (e.g. `7d`) |

## API Endpoints

### Auth — `/api/auth`

| Method | Path | Description |
|---|---|---|
| `POST` | `/login` | Sign in, returns access + refresh tokens |
| `POST` | `/refresh` | Rotate tokens using a valid refresh token |
| `POST` | `/logout` | Invalidate the current refresh token |

### Users — `/api/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/` | — | Register a new account |
| `GET` | `/:id` | JWT | Get a user profile |
| `PATCH` | `/:id` | JWT | Update profile (name, bio, avatarUrl) |

### Notes — `/api/notes`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | JWT | Get all notes for the current user |
| `POST` | `/` | JWT | Create a new note |
| `GET` | `/:id` | JWT | Get a note by ID |
| `PATCH` | `/:id` | JWT | Update a note |
| `DELETE` | `/:id` | JWT | Delete a note |

### Upload — `/api/upload`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/avatar` | JWT | Upload a profile avatar image |

## Database Schema

```
User
  id, email, passwordHash, role (USER/ADMIN)
  firstName, lastName, avatarUrl?, bio?
  notes[], refreshTokens[]

Note
  id, title, content
  userId → User

RefreshToken
  id, tokenHash, expiresAt
  userId → User
```

## Frontend Pages

| Route | Page |
|---|---|
| `/sign-in` | Sign in |
| `/sign-up` | Register |
| `/` | Home — note list |
| `/notes/:id` | Note editor |
| `/account` | Profile settings |
