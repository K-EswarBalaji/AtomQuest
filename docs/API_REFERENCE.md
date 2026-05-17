# GoalQuest Portal - Complete API Reference

## Base URL
```
http://localhost:5000/api
```

All requests require:
- Content-Type: application/json
- Authorization: Bearer {token} (except login/register)

---

## 🔐 Authentication Endpoints

### Register New User
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@company.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "securePassword123",
  "department": "Sales",
  "role": "EMPLOYEE"
}
```

**Response (201):**
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "EMPLOYEE"
  }
}
```

---

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "employee@company.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "employee@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "EMPLOYEE",
    "department": "Sales"
  }
}
```

**Error Response (401):**
```json
{
  "message": "Invalid email or password"
}
```

---

### Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "employee@company.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "avatar": "https://...",
  "role": "EMPLOYEE",
  "department": "Sales",
  "isActive": true,
  "lastLogin": "2024-05-15T10:30:00Z",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### Update Profile
**PUT** `/auth/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "email": "employee@company.com",
    "firstName": "John",
    "lastName": "Smith",
    "phone": "+1234567890"
  }
}
```

---

## 🎯 Goals Endpoints

### Create Goal
**POST** `/goals`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "cycleId": "550e8400-e29b-41d4-a716-446655440000",
  "thrustArea": "SALES",
  "title": "Increase Sales Revenue",
  "description": "Achieve 20% increase in quarterly revenue",
  "unitOfMeasurement": "PERCENTAGE",
  "target": 120,
  "weightage": 40
}
```

**Response (201):**
```json
{
  "message": "Goal created successfully",
  "goal": {
    "id": "uuid",
    "employeeId": "uuid",
    "cycleId": "uuid",
    "thrustArea": "SALES",
    "title": "Increase Sales Revenue",
    "description": "Achieve 20% increase in quarterly revenue",
    "unitOfMeasurement": "PERCENTAGE",
    "target": 120,
    "weightage": 40,
    "status": "DRAFT",
    "progressScore": null,
    "progressStatus": "NOT_STARTED",
    "createdAt": "2024-05-15T10:30:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "weightage",
      "message": "Minimum weightage is 10%"
    }
  ]
}
```

---

### Get Employee Goals
**GET** `/goals/employee/:employeeId?cycleId={cycleId}`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `cycleId` (optional) - Filter by cycle

**Response (200):**
```json
[
  {
    "id": "uuid",
    "employeeId": "uuid",
    "cycleId": "uuid",
    "thrustArea": "SALES",
    "title": "Increase Sales Revenue",
    "target": 120,
    "weightage": 40,
    "actual": null,
    "status": "APPROVED",
    "progressScore": null,
    "progressStatus": "NOT_STARTED",
    "employee": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "employee@company.com"
    },
    "cycle": {
      "name": "FY2024-25 Q1",
      "phase": "GOAL_SETTING"
    }
  }
]
```

---

### Submit Goals for Approval
**POST** `/goals/submit`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "goalIds": ["uuid1", "uuid2", "uuid3"],
  "cycleId": "uuid"
}
```

**Response (200):**
```json
{
  "message": "Goals submitted successfully for approval"
}
```

**Error Response (400):**
```json
{
  "message": "Total weightage must be 100%. Current: 95%"
}
```

---

### Approve/Reject Goal
**POST** `/goals/:goalId/approve`

**Headers:**
```
Authorization: Bearer {token}
Role: MANAGER or ADMIN required
```

**Request Body:**
```json
{
  "approved": true,
  "targetAdjustment": 125,
  "rejectionReason": null
}
```

**Response (200):**
```json
{
  "message": "Goal approved successfully",
  "goal": {
    "id": "uuid",
    "status": "APPROVED",
    "approvedBy": "manager-uuid",
    "approvalDate": "2024-05-15T10:30:00Z",
    "lockedDate": "2024-05-15T10:30:00Z",
    "target": 125
  }
}
```

---

### Get Team Goals (Manager View)
**GET** `/goals/team?cycleId={cycleId}&status={status}`

**Headers:**
```
Authorization: Bearer {token}
Role: MANAGER or ADMIN required
```

**Query Parameters:**
- `cycleId` (optional) - Filter by cycle
- `status` (optional) - DRAFT, SUBMITTED, APPROVED, REJECTED, LOCKED

**Response (200):**
```json
[
  {
    "id": "uuid",
    "employeeId": "uuid",
    "title": "Increase Sales Revenue",
    "status": "SUBMITTED",
    "target": 120,
    "weightage": 40,
    "employee": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "employee@company.com"
    }
  }
]
```

---

## ✅ Check-in Endpoints

### Create Check-in
**POST** `/check-ins`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "goalId": "uuid",
  "cycleId": "uuid",
  "actualAchievement": 115,
  "status": "ON_TRACK",
  "completionDate": "2024-05-20T00:00:00Z",
  "comment": "On track with sales pipeline"
}
```

**Response (201):**
```json
{
  "message": "Check-in created successfully",
  "checkIn": {
    "id": "uuid",
    "goalId": "uuid",
    "actualAchievement": 115,
    "status": "ON_TRACK",
    "progressScore": 95.83,
    "progressStatus": "COMPLETED",
    "checkInDate": "2024-05-15T10:30:00Z"
  }
}
```

---

### Get Check-ins
**GET** `/check-ins?goalId={goalId}&cycleId={cycleId}`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `goalId` (optional) - Filter by goal
- `cycleId` (optional) - Filter by cycle

**Response (200):**
```json
[
  {
    "id": "uuid",
    "goalId": "uuid",
    "actualAchievement": 115,
    "status": "ON_TRACK",
    "progressScore": 95.83,
    "comment": "On track with sales pipeline",
    "managerComment": "Great progress! Keep it up.",
    "goal": {
      "title": "Increase Sales Revenue",
      "target": 120
    },
    "manager": {
      "firstName": "Mike",
      "lastName": "Johnson"
    }
  }
]
```

---

### Add Manager Comment
**PUT** `/check-ins/:checkInId/comment`

**Headers:**
```
Authorization: Bearer {token}
Role: MANAGER or ADMIN required
```

**Request Body:**
```json
{
  "managerComment": "Excellent progress! You're on track to exceed the target."
}
```

**Response (200):**
```json
{
  "message": "Comment added successfully",
  "checkIn": {
    "id": "uuid",
    "managerComment": "Excellent progress! You're on track to exceed the target.",
    "managerId": "manager-uuid"
  }
}
```

---

### Get Team Check-in Status
**GET** `/check-ins/team/status?cycleId={cycleId}`

**Headers:**
```
Authorization: Bearer {token}
Role: MANAGER or ADMIN required
```

**Query Parameters:**
- `cycleId` (optional) - Filter by cycle

**Response (200):**
```json
[
  {
    "employee": {
      "id": "uuid",
      "name": "John Doe",
      "email": "employee@company.com"
    },
    "totalGoals": 3,
    "checkInsCompleted": 2,
    "completionPercentage": "66.67"
  },
  {
    "employee": {
      "id": "uuid",
      "name": "Jane Smith",
      "email": "jane@company.com"
    },
    "totalGoals": 3,
    "checkInsCompleted": 1,
    "completionPercentage": "33.33"
  }
]
```

---

## 📅 Cycles Endpoints

### Create Cycle (Admin)
**POST** `/cycles`

**Headers:**
```
Authorization: Bearer {token}
Role: ADMIN required
```

**Request Body:**
```json
{
  "name": "FY2024-25 Q2",
  "year": 2024,
  "phase": "Q2",
  "startDate": "2024-07-01T00:00:00Z",
  "endDate": "2024-09-30T23:59:59Z",
  "goalSubmissionDeadline": "2024-06-30T23:59:59Z",
  "approvalDeadline": "2024-07-15T23:59:59Z"
}
```

**Response (201):**
```json
{
  "message": "Cycle created successfully",
  "cycle": {
    "id": "uuid",
    "name": "FY2024-25 Q2",
    "year": 2024,
    "phase": "Q2",
    "startDate": "2024-07-01T00:00:00Z",
    "endDate": "2024-09-30T23:59:59Z",
    "isActive": false,
    "createdAt": "2024-05-15T10:30:00Z"
  }
}
```

---

### Get All Cycles
**GET** `/cycles`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "FY2024-25 Q1",
    "year": 2024,
    "phase": "GOAL_SETTING",
    "startDate": "2024-05-01T00:00:00Z",
    "endDate": "2024-06-30T23:59:59Z",
    "isActive": true,
    "createdAt": "2024-05-01T00:00:00Z"
  }
]
```

---

### Get Active Cycle
**GET** `/cycles/active`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "FY2024-25 Q1",
  "year": 2024,
  "phase": "GOAL_SETTING",
  "startDate": "2024-05-01T00:00:00Z",
  "endDate": "2024-06-30T23:59:59Z",
  "isActive": true
}
```

**Error Response (404):**
```json
{
  "message": "No active cycle found"
}
```

---

### Update Cycle (Admin)
**PUT** `/cycles/:cycleId`

**Headers:**
```
Authorization: Bearer {token}
Role: ADMIN required
```

**Request Body:**
```json
{
  "isActive": true,
  "goalSubmissionDeadline": "2024-05-31T23:59:59Z",
  "approvalDeadline": "2024-06-15T23:59:59Z"
}
```

**Response (200):**
```json
{
  "message": "Cycle updated successfully",
  "cycle": {
    "id": "uuid",
    "name": "FY2024-25 Q1",
    "isActive": true
  }
}
```

---

## 📊 Error Handling

All errors follow this format:

```json
{
  "message": "Error description",
  "error": "Additional error details (dev only)"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |

---

## 🔑 Authentication Flow

1. **Register or Login** → Get JWT token
2. **Store token** in localStorage/sessionStorage
3. **Add to requests**: `Authorization: Bearer {token}`
4. **Token expires** after 7 days (configurable)
5. **On 401** → Redirect to login

---

## 📐 Unit of Measurement (UoM)

### NUMERIC
- Higher achievement is better
- Formula: (Actual ÷ Target) × 100
- Example: Revenue target 100, actual 120 = 120%

### PERCENTAGE
- Same as NUMERIC
- Formula: (Actual ÷ Target) × 100
- Example: Target 100%, actual 95% = 95%

### TIMELINE
- Date-based completion
- Formula: 100% if completed by deadline, else (Target ÷ Actual)
- Example: Deadline achieved = 100%

### ZERO_BASED
- 0 achievement = Success
- Formula: 100% if actual = 0, else 0%
- Example: Safety incidents = 0 → 100%

---

## 🔐 Role Permissions

### EMPLOYEE
- Create goals (own)
- Submit goals
- View own goals
- Create/update check-ins
- View own check-in feedback

### MANAGER
- View team goals
- Approve/reject goals
- Edit goal targets during approval
- View team progress
- Add check-in comments
- View team check-in status

### ADMIN
- Create/update cycles
- Manage users
- Create goals for others
- Unlock goals (exception)
- View audit logs
- Access all reports

---

## 📝 Sample Workflow

### 1. Employee Creates Goals
```bash
curl -X POST http://localhost:5000/api/goals \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "cycleId": "uuid",
    "thrustArea": "SALES",
    "title": "Increase Revenue",
    "unitOfMeasurement": "PERCENTAGE",
    "target": 120,
    "weightage": 40
  }'
```

### 2. Employee Submits Goals
```bash
curl -X POST http://localhost:5000/api/goals/submit \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "goalIds": ["uuid1", "uuid2", "uuid3"],
    "cycleId": "cycle-uuid"
  }'
```

### 3. Manager Approves
```bash
curl -X POST http://localhost:5000/api/goals/goal-uuid/approve \
  -H "Authorization: Bearer {manager-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "approved": true,
    "targetAdjustment": 125
  }'
```

### 4. Employee Submits Check-in
```bash
curl -X POST http://localhost:5000/api/check-ins \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "goalId": "uuid",
    "cycleId": "uuid",
    "actualAchievement": 115,
    "status": "ON_TRACK"
  }'
```

### 5. Manager Adds Feedback
```bash
curl -X PUT http://localhost:5000/api/check-ins/checkin-uuid/comment \
  -H "Authorization: Bearer {manager-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "managerComment": "Great progress!"
  }'
```

---

## 🧪 Testing

Use the included demo data:
- **Employee**: employee@company.com / password123
- **Manager**: manager@company.com / password123
- **Admin**: admin@company.com / password123

---

**Last Updated**: May 2024
**Version**: 1.0.0
**API Version**: v1
