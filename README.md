# NoteVault

A full-stack note-taking web application with JWT-based authentication, user profiles, avatar uploads, and an admin dashboard.

## Demo

[![Watch the demo](https://img.youtube.com/vi/5ZZVhPqCV4E/maxresdefault.jpg)](https://youtu.be/5ZZVhPqCV4E)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS v4, shadcn/ui (Radix UI), Lucide React, Sonner |
| Backend | NestJS 11, TypeScript, Prisma ORM 7 |
| Database | PostgreSQL |
| Auth | JWT (access + refresh token rotation), Passport.js |
| Container | Docker Compose |

## Project Structure

```
SmartMemoAI/
├── frontend/               # React + Vite SPA
│   └── src/
│       ├── app/            # Pages and layout
│       ├── components/     # UI (shadcn/ui), common, and note components
│       ├── context/        # AuthContext
│       ├── hooks/          # useNotesApi, useAutoSave
│       ├── lib/            # Utilities
│       └── types/          # TypeScript types
├── backend/                # NestJS REST API
│   └── src/
│       ├── auth/           # Guards, strategies, decorators, DTOs
│       ├── users/          # User CRUD + repository
│       ├── notes/          # Note CRUD + repository
│       ├── upload/         # Avatar upload (Multer)
│       ├── prisma/         # Prisma client module
│       ├── config/         # Env validation (Joi)
│       └── commen/         # Filters, interceptors, enums
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
- **Admin dashboard** — Admins can view all registered users, edit their roles, and delete accounts from a dedicated dashboard page.
- **Protected routes** — All app routes require authentication; unauthenticated users are redirected to `/sign-in`.
- **Toast notifications** — User-facing success and error messages via Sonner.
- **Glassmorphism UI** — Modern frosted-glass card design throughout the interface.

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

### Backend — `backend/.env.example`

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `FRONTEND_URL` | Allowed CORS origin (default: `http://localhost:5173`) |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens (min 32 chars) |
| `JWT_ACCESS_EXPIRY` | Access token lifetime (e.g. `15m`) |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens (min 32 chars) |
| `JWT_REFRESH_EXPIRY` | Refresh token lifetime (e.g. `7d`) |

### Frontend — `frontend/.env`

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API URL (default: `http://localhost:3000`) |

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
| `GET` | `/` | ADMIN | List all users |
| `POST` | `/` | — | Register a new account |
| `GET` | `/:id` | JWT | Get a user profile |
| `PATCH` | `/:id` | JWT | Update profile (name, bio, avatarUrl) |
| `DELETE` | `/:id` | ADMIN | Delete a user account |

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
  id, title, content, createdAt, updatedAt
  userId → User

RefreshToken
  id, tokenHash, expiresAt, createdAt
  userId → User
```

## Frontend Pages

| Route | Page | Access |
|---|---|---|
| `/sign-in` | Sign in | Public |
| `/sign-up` | Register | Public |
| `/` | Home — note list | Authenticated |
| `/notes/:id` | Note editor | Authenticated |
| `/account` | Profile settings | Authenticated |
| `/dashboard` | Admin dashboard | Admin only |
| `*` | 404 Not Found | Authenticated |
