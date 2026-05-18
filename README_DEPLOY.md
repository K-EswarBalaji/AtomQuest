## Deploying goalquest-portal (Frontend → Vercel, Backend → Railway)

This document explains how to deploy the `frontend` to Vercel and the `backend` + Postgres to Railway.

High-level steps
- Push your repo to GitHub (branch `main` recommended).
- Create a Railway project with a Node service for the `backend` and a Railway Postgres database.
- Create a Vercel project for the `frontend`.
- Add required environment variables in Railway and Vercel.

Required GitHub repository secrets (only if you use CI deployment):
- `VERCEL_TOKEN` — Vercel personal token
- `VERCEL_PROJECT_ID` — Vercel project id for the frontend
- `VERCEL_ORG_ID` — Vercel organization id

Important environment variables to set on providers

- Backend (set these in Railway service environment):
  - `NODE_ENV=production`
  - `DATABASE_URL` (connection string from Railway Postgres)
  - `JWT_SECRET` (strong secret)
  - `FRONTEND_URL` (set to your Vercel domain, e.g. `https://your-app.vercel.app`)
  - Optional: `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`, `AZURE_*`, `LOG_LEVEL`

- Frontend (set these in Vercel Environment Variables):
  - `REACT_APP_API_URL = https://<your-backend-domain>/api`

How the workflow works (optional)
- On push to `main` the workflow:
  1. Installs dependencies for backend and frontend.
  2. Builds the frontend and deploys to Vercel using the `VERCEL_TOKEN` and project/org ids.

Post-deploy steps
- Run migrations & seeds on Railway: open Railway dashboard → your backend service → Shell and run:
  ```bash
  cd /app/backend
  npm ci
  npm run migrate
  npm run seed
  ```

Verification
- Backend health endpoint: `https://<your-backend-domain>/health`
- Frontend URL: `https://<your-frontend-domain>`

If you want, I can also adapt the workflow to deploy to Netlify/Heroku instead — tell me which provider you prefer.
