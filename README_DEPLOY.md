## Deploying goalquest-portal (Frontend → Vercel, Backend → Render)

This document explains how to deploy the `frontend` to Vercel and the `backend` to Render using a GitHub Actions workflow included in this repo.

High-level steps
- Push your repo to GitHub (branch `main` recommended).
- Create a Render Web Service for the `backend` and a Render Postgres database.
- Create a Vercel project for the `frontend`.
- Add required environment variables/secrets in Render, Vercel and GitHub.
- The included GitHub Actions workflow will trigger on pushes to `main` and deploy both services.

Required GitHub repository secrets (add in repository Settings → Secrets):
- `RENDER_API_KEY` — Render account API key
- `RENDER_SERVICE_ID` — Render service id for the backend (example: `srv-xxxxx`)
- `VERCEL_TOKEN` — Vercel personal token
- `VERCEL_PROJECT_ID` — Vercel project id for the frontend
- `VERCEL_ORG_ID` — Vercel organization id

Important environment variables to set on providers

- Backend (set these in Render service environment):
  - `NODE_ENV=production`
  - `DATABASE_URL` (connection string from Render Postgres) OR `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `DB_DIALECT=postgres`
  - `JWT_SECRET` (strong secret)
  - `FRONTEND_URL` (set to your Vercel domain, e.g. `https://your-app.vercel.app`)
  - Optional: `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`, `AZURE_*`, `LOG_LEVEL`

- Frontend (set these in Vercel Environment Variables):
  - `REACT_APP_API_URL = https://<your-backend-domain>/api`

How the workflow works
- On push to `main` the workflow:
  1. Installs dependencies for backend and frontend.
  2. Triggers a Render deploy for the backend using the Render API and your `RENDER_API_KEY` + `RENDER_SERVICE_ID`.
  3. Builds the frontend and deploys to Vercel using the `VERCEL_TOKEN` and project/org ids.

Post-deploy steps
- Run migrations & seeds on Render: open Render dashboard → your backend service → Shell and run:
  ```bash
  cd /opt/render/project/src/backend
  npm ci
  npm run migrate
  npm run seed
  ```

Verification
- Backend health endpoint: `https://<your-backend-domain>/health`
- Frontend URL: `https://<your-frontend-domain>`

If you want, I can also adapt the workflow to deploy to Netlify/Heroku instead — tell me which provider you prefer.
