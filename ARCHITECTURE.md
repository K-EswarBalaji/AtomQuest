# GoalQuest Portal Architecture

## Overview

GoalQuest Portal is a full-stack goal setting and tracking system with a React frontend, an Express backend, and a PostgreSQL database. The frontend is deployed on Vercel, while the backend API and database run on Railway. The frontend handles login, role-based navigation, goals, approvals, check-ins, cycles, users, reports, and audit logs. The backend exposes REST APIs for authentication, goal workflow, check-ins, cycle management, and administrative actions.

## Architecture Diagram

```mermaid
flowchart TB
  U[User Browser] --> F[React 18 + TypeScript Frontend (Vercel)]
  F --> R[React Router]
  F --> S[UI Components, Pages, State]
  F --> A[Axios API Service]
  A --> B[Express API Backend (Railway)]

  B --> M[Auth Middleware]
  B --> C[Controllers]
  C --> GC[Goal Controller]
  C --> AC[Auth Controller]
  C --> CC[Check-in Controller]
  C --> YC[Cycle Controller]
  C --> UC[User Controller]
  C --> RC[Audit Log Controller]

  GC --> V[Validation Utilities]
  CC --> V
  B --> DB[Sequelize Models]
  DB --> P[(PostgreSQL Database - Railway)]

  B --> L[Audit Logs]
  C --> L
```

## Main Layers

### Frontend
- `frontend/src/App.tsx` defines the route map
- `frontend/src/pages/` contains the screens for each workflow
- `frontend/src/components/` contains reusable UI pieces
- `frontend/src/services/api.ts` handles API calls
- `frontend/src/context/authStore.ts` manages auth state

### Backend
- `backend/src/index.js` starts the API server
- `backend/src/routes/` defines REST endpoints
- `backend/src/controllers/` holds business logic
- `backend/src/middleware/auth.js` protects routes and roles
- `backend/src/utils/validation.js` enforces goal rules and progress scoring

### Data Layer
- `backend/src/models/` defines Sequelize models and relationships
- PostgreSQL stores users, cycles, goals, check-ins, and audit logs

## Deployment
- Frontend: Vercel (React build)
- Backend API: Railway (Node/Express)
- Database: Railway Postgres

## Core Data Flow

1. User signs in through the login page.
2. The frontend stores auth state and routes the user based on role.
3. The frontend calls backend APIs through Axios.
4. The backend validates the token and role.
5. Controllers apply business rules and persist changes through Sequelize.
6. The database saves the resulting records and audit history.

## Key Workflows

- Employee creates goals, then submits them for approval.
- Manager or admin reviews submitted goals and approves or rejects them.
- Employee adds quarterly check-ins against approved goals.
- Admin manages cycles, users, reports, and audit logs.

## Business Rules

- Total goal weightage must equal 100%.
- Each goal must have at least 10% weightage.
- Each employee can have at most 8 goals per cycle.
- Approved goals are locked for read-only tracking.
- Progress scoring depends on the selected unit of measurement.
