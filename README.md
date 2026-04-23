# 🛫 Altitude Atlas — Flight Tracker

A secure, scalable, and operationally-aware flight tracking application built with TypeScript across the entire stack.

## 🏗️ Architecture

- **`shared/`**: Single source of truth for type contracts. Guarantees 100% type safety between frontend and backend.
- **`backend/`**: Express 5 API using Prisma 6 and PostgreSQL.
  - **Security**: HttpOnly cookies for JWT, CORS hardening, and strict input validation.
  - **Ops**: Admin audit logging on all status updates.
- **`frontend/`**: Vite + React 19 + Zustand.
  - **UX**: Custom hook-based data layer with auto-refresh and window-focus rehydration.
  - **Auth**: Ephemeral state management (no sensitive tokens in `localStorage`).

## 🚀 Local Setup

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL instance

### 2. Backend Setup
```bash
cd backend
npm install
# Copy .env.example to .env and follow instructions in the file to generate secrets
cp .env.example .env 
npm run prisma:generate
npm run prisma:migrate  # Applies schema and creates migration history
npm run prisma:seed     # Creates the default admin account
npm run dev
```
Backend runs on `http://localhost:4000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Frontend runs on `http://localhost:5173`.

## 🧪 Testing

The app includes a comprehensive test suite covering booking flows, auth security, and operational logging.

```bash
# Backend tests (Vitest + Supertest + Prisma Mocks)
cd backend && npm test

# Frontend tests (Vitest + Testing Library + User Event)
cd frontend && npm test
```

## 🛠️ Key Technical Features (Audit II)

- **XSS Immunity**: Session tokens are stored in HttpOnly cookies.
- **Smart Rehydration**: Automatic session recovery on page refresh via `/api/admin/me`.
- **Global Error Handling**: Centralized 401 interceptor for clean session expiry handling.
- **Optimized Queries**: DB-level indexes on high-traffic fields (Reference, CreatedAt).
- **Scalable Dashboard**: Server-side pagination support for large datasets.

---

*This project has undergone a complete systems audit. See `Audit II.md` for the full remediation report.*
