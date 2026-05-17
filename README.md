# GoalQuest Portal

GoalQuest Portal is a goal setting and tracking web app for employees, managers, and admins. The current UI supports goal creation, approval, quarterly check-ins, team review, cycle management, user management, reports, and audit logs.

## What the website includes

- Login screen with demo credentials
- Role-based navigation and dashboard
- Employee goal creation with thrust area, unit of measurement, target, and weightage
- Manager and admin approval workflow for submitted goals
- Quarterly check-ins with achievement updates and progress scoring
- Team goals view for managers and admins
- Cycle management for admins
- User management for admins
- Reports page with CSV download actions
- Audit logs page for governance history
- Responsive layout with dark mode support

## Validation and business rules

- Total goal weightage must equal 100%
- Minimum weightage per goal is 10%
- Maximum of 8 goals per employee per cycle
- Approved goals are locked
- Progress scoring is calculated from the selected unit of measurement

## Routes in the app

- `/login`
- `/dashboard`
- `/goals`
- `/approvals`
- `/check-ins`
- `/team-goals`
- `/cycles`
- `/users`
- `/reports`
- `/audit-logs`

## Tech stack

Frontend:

- React 18
- TypeScript
- React Router
- Axios
- Zustand
- Tailwind CSS

Backend:

- Node.js
- Express
- PostgreSQL
- Sequelize
- JWT authentication

## Project structure

- `backend/` - Express API, models, controllers, routes, middleware, utilities, and seed data
- `frontend/` - React app, pages, components, hooks, context, services, and styles
- `docs/` - Architecture, deployment, and API documentation
- `docker-compose.yml` - Multi-container local setup

## Setup

### Prerequisites

- Node.js
- PostgreSQL
- Docker, if you want to run the full stack in containers

### Backend

```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### Docker

```bash
docker-compose up
```

## Demo credentials

- Employee: employee@company.com / password123
- Manager: manager@company.com / password123
- Admin: admin@company.com / password123

## API endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `POST /api/goals`
- `GET /api/goals/employee/me`
- `GET /api/goals/employee/:employeeId`
- `POST /api/goals/submit`
- `POST /api/goals/:goalId/approve`
- `GET /api/goals/team`
- `POST /api/check-ins`
- `GET /api/check-ins`
- `PUT /api/check-ins/:checkInId/comment`
- `GET /api/check-ins/team/status`
- `POST /api/cycles`
- `GET /api/cycles`
- `GET /api/cycles/active`
- `PUT /api/cycles/:cycleId`

## License

Proprietary - ATOMQUEST Hackathon 2026
