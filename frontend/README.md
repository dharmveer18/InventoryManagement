# Inventory Management System — Frontend

React 18 + Vite + TypeScript UI for the Inventory Management System. Uses MUI, TanStack Query, and JWT auth.

## Prerequisites
- Node.js 18+ (v20 recommended)
- npm (bundled with Node)
- Backend running locally (see `backend/README.md`)

## Setup

1) Install dependencies

```bash
npm install
```

2) Configure API URL

Create a `.env` file in the frontend root:

```bash
VITE_API_URL=http://localhost:8000
```

Note: The app will call `${VITE_API_URL}/api` for all requests.

3) Start the dev server

```bash
npm run dev
```

App runs at http://localhost:5173. Login page: http://localhost:5173/login

## Login (seeded users)
Run `python backend/manage.py seed_users` then use any of:

- admin.user / Admin@123 — admin
- manager.user / Manager@123 — manager
- basic.user1 / Basic@123 — viewer
- basic.user2 / Basic@123 — viewer

## Scripts
- Dev: `npm run dev`
- Build: `npm run build` (outputs `dist/`)
- Preview: `npm run preview`
- Lint: `npm run lint`
- Tests: `npm test`, `npm run test:ui`, `npm run test:coverage`

## Project structure
- `src/` — app code
	- `api/` — Axios client and API helpers
	- `auth/` — auth context, guards, token handling
	- `pages/` — `Dashboard`, `AdminDashboard`, `Login`, etc.
	- `components/` — dialogs, tables, forms
	- `utils/`, `hooks/`, `types/`
- `public/` — static assets (sample CSVs, etc.)

## Docker (optional)

```bash
docker-compose up -d frontend --build
```

Then open http://localhost:80 (if mapped in your compose file).

## Troubleshooting
- Cannot login: ensure backend is running and `VITE_API_URL` points to it.
- 401s after some time: tokens may expire; refresh is automatic, but re-login if needed.
- API errors: check browser console and backend logs.
- Type errors: run `npm test` and fix TS errors before building.