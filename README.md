# Flight Tracker

TypeScript full-stack flight tracker with:

- `backend/`: Express API, Prisma, PostgreSQL, JWT admin auth
- `frontend/`: Vite + React + TypeScript client with Zustand auth state

## Local setup

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Backend runs on `http://localhost:4000`.

### 2. Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Production builds

```bash
cd backend
npm run build
npm start
```

```bash
cd frontend
npm run build
```

## Key flows

1. Create a booking on `/`
2. View the boarding pass at `/boarding/:ref`
3. Track a booking on `/track`
4. Sign in at `/admin/login`
5. Update status, gate, and delay from `/admin/booking/:ref`

## Test commands

```bash
cd backend
npm test
```

```bash
cd frontend
npm test
```
