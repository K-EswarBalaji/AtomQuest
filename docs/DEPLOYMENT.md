# GoalQuest Portal - Setup & Deployment Guide

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+
- PostgreSQL 12+ (or Docker)
- npm or yarn

### Option 1: Docker Compose (Recommended)

```bash
# Clone and navigate
git clone <repository-url>
cd goalquest-portal

# Start all services
docker-compose up

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# Database: localhost:5432
```

**Demo Credentials:**
```
Employee: employee@company.com / password123
Manager: manager@company.com / password123
Admin: admin@company.com / password123
```

### Option 2: Manual Setup

#### Backend

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Create database
createdb goalquest_db

# Seed demo data
npm run seed

# Start development server
npm run dev
# Server runs on http://localhost:5000
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development server
npm start
# App opens on http://localhost:3000
```

## 📝 User Workflows

### Employee Workflow
1. **Login** → Dashboard
2. **Create Goals** → Fill goal details with weightage
3. **Validate** → Ensure total weightage = 100%
4. **Submit** → Send for manager approval
5. **Wait** → Manager reviews
6. **Check-in** → Update achievement quarterly
7. **View Feedback** → Manager comments

### Manager Workflow
1. **Login** → Dashboard
2. **Review Goals** → See pending approvals
3. **Edit/Approve** → Adjust targets if needed
4. **Send Feedback** → Accept or reject
5. **Monitor** → View team progress
6. **Conduct Check-ins** → Review achievement
7. **Add Comments** → Provide structured feedback

### Admin Workflow
1. **Login** → Dashboard
2. **Manage Cycles** → Create/configure periods
3. **Manage Users** → Add employees/managers
4. **Set Org Hierarchy** → Configure reporting lines
5. **Configure Rules** → Set deadlines, escalations
6. **Review Reports** → Analytics & audit trails
7. **Exception Handling** → Unlock goals if needed

## 🔧 Configuration

### Backend Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_USER=goalquest_user
DB_PASSWORD=secure_password_123
DB_NAME=goalquest_db
DB_PORT=5432
DB_DIALECT=postgres

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Azure Entra ID (Optional)
AZURE_CLIENT_ID=your_azure_client_id
AZURE_CLIENT_SECRET=your_azure_client_secret
AZURE_TENANT_ID=your_tenant_id

# Frontend
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=info
```

### Frontend Environment Variables

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## 🌐 Deployment

### AWS Deployment

#### Using ECS (Recommended)

```bash
# 1. Build images
docker build -t goalquest-backend:latest ./backend
docker build -t goalquest-frontend:latest ./frontend

# 2. Push to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker tag goalquest-backend:latest \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/goalquest-backend:latest
docker push \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/goalquest-backend:latest

docker tag goalquest-frontend:latest \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/goalquest-frontend:latest
docker push \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/goalquest-frontend:latest

# 3. Create ECS Task Definition (or use CloudFormation/Terraform)
# 4. Create ECS Service with Load Balancer
# 5. Configure RDS PostgreSQL database
# 6. Map domain and enable HTTPS
```

#### Using App Runner (Simpler)

```bash
# Create repository connections, then deploy from GitHub directly
# Auto-scaling and HTTPS handled automatically
```

### Azure Deployment

```bash
# 1. Create resource group
az group create --name goalquest-rg --location eastus

# 2. Create App Service
az appservice plan create --name goalquest-plan --resource-group goalquest-rg --sku B2
az webapp create --name goalquest-app --plan goalquest-plan --resource-group goalquest-rg

# 3. Configure deployment (GitHub Actions, Azure DevOps)
# 4. Create PostgreSQL database
# 5. Configure networking and HTTPS
```

### Kubernetes Deployment

```bash
# Create namespace
kubectl create namespace goalquest

# Create ConfigMap & Secrets
kubectl create configmap goalquest-config --from-file=.env -n goalquest
kubectl create secret generic db-secret --from-literal=password=*** -n goalquest

# Deploy services
kubectl apply -f k8s/postgres-deployment.yaml -n goalquest
kubectl apply -f k8s/backend-deployment.yaml -n goalquest
kubectl apply -f k8s/frontend-deployment.yaml -n goalquest

# Create services
kubectl expose deployment backend --port=5000 -n goalquest
kubectl expose deployment frontend --port=3000 -n goalquest

# Setup Ingress (optional)
kubectl apply -f k8s/ingress.yaml -n goalquest
```

## 🧪 Testing

### Run Backend Tests

```bash
cd backend
npm test
npm run test:coverage
```

### Run Frontend Tests

```bash
cd frontend
npm test
npm run test:coverage
```

### Run E2E Tests

```bash
npm run test:e2e  # Requires both services running
```

## 📊 API Documentation

### Health Check
```bash
curl http://localhost:5000/health
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"employee@company.com","password":"password123"}'
```

Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "employee@company.com",
    "firstName": "John",
    "role": "EMPLOYEE"
  }
}
```

### Create Goal
```bash
curl -X POST http://localhost:5000/api/goals \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "cycleId": "uuid",
    "thrustArea": "SALES",
    "title": "Increase Revenue",
    "description": "Achieve 20% growth",
    "unitOfMeasurement": "PERCENTAGE",
    "target": 120,
    "weightage": 40
  }'
```

See [API_REFERENCE.md](./API_REFERENCE.md) for complete API documentation.

## 🔒 Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use strong database password
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS properly
- [ ] Enable database backups
- [ ] Set up monitoring & alerting
- [ ] Implement rate limiting
- [ ] Enable audit logging
- [ ] Regular security updates
- [ ] Database encryption at rest

## 📈 Performance Tuning

### Database
- Enable query logging to identify slow queries
- Add indexes on frequently filtered columns
- Use connection pooling
- Archive old audit logs quarterly

### Frontend
- Enable gzip compression
- Minify assets
- Use CDN for static files
- Implement lazy loading

### Backend
- Enable response caching
- Use connection pooling
- Implement pagination
- Monitor memory usage

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check database is running
psql -U goalquest_user -d goalquest_db

# Check env variables
cat backend/.env

# Verify connection string format
# postgres://user:password@host:port/database
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000
kill -9 <PID>

# Or change port in .env
```

### CORS Errors
```bash
# Verify FRONTEND_URL in backend .env matches
# FRONTEND_URL=http://localhost:3000

# Check REACT_APP_API_URL in frontend .env
# REACT_APP_API_URL=http://localhost:5000/api
```

### Authentication Issues
```bash
# Check token in browser localStorage
# Clear localStorage if expired
localStorage.clear()

# Re-login to get new token
```

## 📚 Documentation Structure

```
docs/
├── ARCHITECTURE.md          # System design & tech stack
├── DEPLOYMENT.md            # This file
├── API_REFERENCE.md         # Complete API documentation
├── USER_GUIDE.md            # End-user documentation
├── ADMIN_GUIDE.md           # Administrator guide
├── DATABASE_SCHEMA.md       # Database design details
└── TROUBLESHOOTING.md       # Common issues & solutions
```

## 🤝 Support

For issues or questions:
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review logs: `docker-compose logs -f`
3. Check GitHub Issues
4. Contact development team

## 📄 License

Proprietary - ATOMQUEST Hackathon 2024

---

**Last Updated**: May 2024
**Version**: 1.0.0
