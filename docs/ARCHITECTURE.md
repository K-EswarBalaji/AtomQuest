# GoalQuest Portal - Architecture Documentation

## System Overview

GoalQuest is a comprehensive, cloud-ready web-based Goal Setting & Tracking Portal built with modern technologies. The production deployment uses Vercel for the React frontend and Railway for the Express API and PostgreSQL database. The system supports the complete lifecycle of employee goals - from creation and approval to quarterly check-ins and performance analytics.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                         │
│  React 18 + TypeScript + TailwindCSS (Vercel)               │
│  (Responsive Web App - Mobile & Desktop)                    │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS/REST API
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Backend Layer (Railway)                  │
│                   Node.js/Express                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Authentication & Authorization (JWT)             │    │
│  │  Role-Based Access Control (RBAC)                │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Business Logic Services                           │    │
│  │  • Goal Management                                 │    │
│  │  • Approval Workflow                              │    │
│  │  • Check-in Processing                            │    │
│  │  • Cycle Management                               │    │
│  │  • Reporting & Analytics                          │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Validation & Business Rules                       │    │
│  │  • Weightage Validation (100%)                    │    │
│  │  • Goal Count Limits (Max 8)                      │    │
│  │  • Progress Score Calculation                     │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Data Access Layer (ORM)                         │
│        Sequelize with Relationships Mapping                 │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Database Layer (Railway)                       │
│  PostgreSQL 12+ (Primary Data Store)                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Tables:                                           │    │
│  │  • users (Employees, Managers, Admins)           │    │
│  │  • cycles (Goal cycles/periods)                   │    │
│  │  • goals (Goal definitions & targets)             │    │
│  │  • check_ins (Achievement tracking)               │    │
│  │  • audit_logs (Compliance & governance)           │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────┘
```

## Tech Stack Details

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS + Custom CSS
- **State Management**: Zustand (lightweight alternative to Redux)
- **HTTP Client**: Axios with JWT interceptors
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Responsiveness**: Mobile-first design approach

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: JavaScript (can be upgraded to TypeScript)
- **Database ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet.js, CORS, bcryptjs
- **Validation**: express-validator
- **Logging**: Winston

### Database
- **Primary**: PostgreSQL 12+
- **Connection Pool**: Built-in Sequelize connection pooling
- **Backup Strategy**: Docker volume persistence
- **Indexing**: Automatic on foreign keys and timestamps

### Deployment
- **Containerization**: Docker & Docker Compose
- **Cloud Ready**: AWS, Azure, Google Cloud compatible
- **Scalability**: Stateless backend design

## Database Schema

### Users Table
```
- id (UUID, Primary Key)
- email (String, Unique)
- firstName, lastName (String)
- password (Hashed with bcrypt)
- role (ENUM: EMPLOYEE, MANAGER, ADMIN)
- department (String)
- reportingManagerId (FK to Users)
- isActive (Boolean)
- lastLogin (DateTime)
- ssoProvider, ssoId (For Entra ID integration)
```

### Cycles Table
```
- id (UUID, Primary Key)
- name (String)
- year (Integer)
- phase (ENUM: GOAL_SETTING, Q1, Q2, Q3, Q4_ANNUAL)
- startDate, endDate (DateTime)
- goalSubmissionDeadline, approvalDeadline (DateTime)
- isActive (Boolean)
```

### Goals Table
```
- id (UUID, Primary Key)
- employeeId (FK)
- cycleId (FK)
- thrustArea (String)
- title, description (String/Text)
- unitOfMeasurement (ENUM: NUMERIC, PERCENTAGE, TIMELINE, ZERO_BASED)
- target (Decimal)
- actual (Decimal, nullable)
- weightage (Decimal)
- status (ENUM: DRAFT, SUBMITTED, APPROVED, REJECTED, LOCKED)
- progressStatus (ENUM: NOT_STARTED, ON_TRACK, COMPLETED, AT_RISK)
- progressScore (Decimal, computed)
- approvedBy (FK)
- approvalDate (DateTime)
```

### CheckIns Table
```
- id (UUID, Primary Key)
- goalId (FK)
- cycleId (FK)
- managerId (FK)
- actualAchievement (Decimal)
- status (ENUM: NOT_STARTED, ON_TRACK, COMPLETED, AT_RISK)
- completionDate (DateTime)
- comment (Text)
- managerComment (Text)
- checkInDate (DateTime)
```

### AuditLogs Table
```
- id (UUID, Primary Key)
- userId (FK)
- action (String)
- entityType (String)
- entityId (UUID)
- oldValues (JSONB)
- newValues (JSONB)
- reason (Text)
- ipAddress (String)
- createdAt (DateTime)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Goals Management
- `POST /api/goals` - Create goal
- `GET /api/goals/employee/:id` - Get employee goals
- `POST /api/goals/submit` - Submit goals for approval
- `POST /api/goals/:id/approve` - Approve/reject goal
- `GET /api/goals/team` - Get team goals (Manager)

### Check-ins
- `POST /api/check-ins` - Create check-in
- `GET /api/check-ins` - Get check-ins
- `PUT /api/check-ins/:id/comment` - Add manager comment
- `GET /api/check-ins/team/status` - Team check-in status

### Cycles
- `POST /api/cycles` - Create cycle (Admin)
- `GET /api/cycles` - List all cycles
- `GET /api/cycles/active` - Get active cycle
- `PUT /api/cycles/:id` - Update cycle (Admin)

## Validation Rules

### Goal Weightage
- ✅ Total weightage across all goals = 100%
- ✅ Minimum per goal = 10%
- ✅ Maximum per goal = 100%

### Goal Count
- ✅ Minimum: 1 goal
- ✅ Maximum: 8 goals per employee per cycle

### Approval Workflow
- Draft → Submitted → Approved/Rejected → Locked
- Once approved, goals are locked (immutable)
- Admin can unlock for exception handling

### Progress Scoring
| UoM Type | Formula | Example |
|----------|---------|---------|
| NUMERIC | Achievement ÷ Target × 100 | 150/100 = 150% |
| PERCENTAGE | Same as NUMERIC | 95/100 = 95% |
| TIMELINE | Target ÷ Achievement (if actual ≤ target) | On time = 100% |
| ZERO_BASED | 100 if 0, else 0 | 0 incidents = 100% |

## Security Features

1. **Authentication**
   - JWT tokens with configurable expiry (default: 7 days)
   - Secure password hashing with bcryptjs (10 salt rounds)
   - Token refresh capability

2. **Authorization**
   - Role-Based Access Control (RBAC)
   - Three roles: Employee, Manager, Admin
   - Granular endpoint-level permissions

3. **Data Protection**
   - Helmet.js for HTTP headers security
   - CORS enabled for specific origin
   - HTTPS enforced in production
   - SQL injection prevention (Sequelize ORM)

4. **Audit Trail**
   - All changes logged with user, action, timestamp
   - Change history stored in AuditLogs table
   - Reason for admin unlock/override

## Deployment Instructions

### Local Development

```bash
# 1. Clone repository
git clone <repo-url>
cd goalquest-portal

# 2. Backend setup
cd backend
cp .env.example .env
npm install
npm run seed  # Populate demo data
npm run dev

# 3. Frontend setup (new terminal)
cd frontend
cp .env.example .env
npm install
npm start
```

### Current Production Deployment (Vercel + Railway)

- Frontend: Vercel (React build output)
- Backend API: Railway (Node/Express)
- Database: Railway Postgres

### Docker Deployment (Optional)

```bash
# Single command setup
docker-compose up

# Demo Credentials
# Employee: employee@company.com / password123
# Manager: manager@company.com / password123
# Admin: admin@company.com / password123
```

### Cloud Deployment (AWS Example - Optional)

```bash
# 1. Build Docker images
docker build -t goalquest-backend ./backend
docker build -t goalquest-frontend ./frontend

# 2. Push to ECR (Elastic Container Registry)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com

docker tag goalquest-backend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/goalquest-backend:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/goalquest-backend:latest

# 3. Deploy on ECS, EKS, or App Runner
```

## Good-to-Have Features Roadmap

### 1. Microsoft Entra ID Integration
- SSO login via Azure AD
- Org hierarchy auto-sync
- Role mapping from Azure groups

### 2. Email & Teams Integration
- Automated notifications for approvals/rejections
- Teams bot for goal submissions
- Deep-link support in notifications

### 3. Escalation Module
- Configurable escalation rules
- Auto-notification chains
- Escalation dashboard

### 4. Analytics Dashboard
- QoQ achievement trends
- Department-level heatmaps
- Manager effectiveness metrics
- Goal distribution analysis

## Performance Optimizations

1. **Database**
   - Connection pooling (Sequelize)
   - Indexed queries on frequently accessed fields
   - N+1 query prevention through joins

2. **Caching** (Future)
   - Redis for session management
   - ETag support for read operations

3. **Frontend**
   - Code splitting with React.lazy
   - Image optimization
   - Lazy loading of components

## Monitoring & Logging

1. **Backend Logging**
   - Winston logger with file rotation
   - Separate logs for errors, warnings, info
   - Request/response logging in development

2. **Error Tracking** (Future)
   - Sentry integration for exception tracking
   - Error rate monitoring

3. **Health Checks**
   - `/health` endpoint for load balancers
   - Database connection health

## Cost Optimization

1. **Infrastructure**
   - Containerized services (horizontal scaling)
   - Serverless option for APIs (AWS Lambda)
   - RDS with auto-scaling

2. **Database**
   - Connection pooling reduces overhead
   - Query optimization through indexing
   - Archive old data to cheaper storage

3. **Frontend**
   - Static content CDN (CloudFront, Cloudflare)
   - Minified and compressed assets

## Scalability Considerations

- **Vertical**: Increase server resources (CPU, RAM)
- **Horizontal**: Load balancing (Nginx, AWS ALB)
- **Database**: Read replicas, partitioning by cycle/year
- **Caching**: Redis for high-read endpoints
- **Async**: Message queues for bulk operations (future)

## Testing Strategy

- **Unit Tests**: Jest for business logic validation
- **Integration Tests**: API endpoint testing with SuperTest
- **E2E Tests**: Cypress for user workflows
- **Load Testing**: K6 or JMeter for performance

## Support & Maintenance

- Regular security patches
- Database backups (automated daily)
- Log rotation and cleanup
- Performance monitoring
- User support documentation

---

**Last Updated**: May 2026
**Version**: 1.0.0
**Status**: Production Ready
