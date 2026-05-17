# Render deployment notes

Follow these steps to create and configure the backend service on Render.

1. Create a Postgres database on Render:
   - Render Dashboard → Databases → New Database
   - Choose Postgres, select plan, create database
   - Copy the `Connection URL` (use this as `DATABASE_URL`)

2. Create a Web Service for the backend:
   - Render Dashboard → Services → New → Web Service
   - Connect your GitHub repository and select the `backend` folder as the root.
   - Build Command: `npm ci`
   - Start Command: `npm start`
   - Region: choose your preferred region

3. Set environment variables (Service → Environment):
   - `DATABASE_URL` = your Render Postgres connection string
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = (strong secret)
   - `FRONTEND_URL` = `https://<your-frontend-domain>`
   - Optional email / azure vars per `backend/.env.example`

4. Deploys via GitHub Actions:
   - The workflow in `.github/workflows/deploy.yml` will call the Render deploy API when you push to `main`.
   - To trigger that workflow, add the following GitHub secrets: `RENDER_API_KEY` and `RENDER_SERVICE_ID`.

5. Running migrations & seeds:
   - After the service is deployed, open Render → your backend service → Shell and run:
     ```bash
     cd /opt/render/project/src/backend
     npm ci
     npm run migrate
     npm run seed
     ```

6. Health check
   - Visit `https://<your-backend-domain>/health` to verify the backend is responding.
