# Goal Approval Flow - Complete Guide

## Understanding the Issue

When an **employee creates a new goal**, it doesn't immediately appear in the **manager's approval page**. Here's why and what to do:

---

## Complete Goal Lifecycle

### Step 1: Employee Creates a Goal (DRAFT Status)
- Employee goes to **My Goals** page
- Clicks **"New Goal"** button
- Fills in goal details (thrust area, title, target, etc.)
- Clicks **"Save Goal"**
- ✅ Goal is now in **DRAFT** status
- ❌ **NOT visible** to manager yet (only employee sees it)

### Step 2: Employee Submits All Goals (SUBMITTED Status)
- Employee adds multiple goals (minimum 3, maximum 8)
- **Important**: Total weightage must equal exactly **100%**
- Clicks **"Submit All Goals for Approval"** button
- ✅ All goals change to **SUBMITTED** status
- ✅ **NOW visible** to manager in Approvals page

### Step 3: Manager Reviews & Approves (APPROVED Status)
- Manager goes to **Approvals** page
- Sees all **SUBMITTED** goals from their direct reports
- Can:
  - ✅ **Approve** the goal (with optional target adjustment)
  - ❌ **Reject** the goal (with rejection reason)
- ✅ Approved goals move to **APPROVED** status
- ❌ Rejected goals move to **REJECTED** status

### Step 4: Admin Reviews All Goals
- Admin goes to **Approvals** page
- Sees **ALL SUBMITTED** goals (from all employees, not just direct reports)
- Can approve or reject like managers

---

## Key Points

✅ **What was fixed:**
1. Admin now sees ALL submitted goals (not limited to direct reports)
2. Manager sees only their direct reports' goals
3. ApprovalsPage refreshes after approval to show updated status

⚠️ **What employees must do:**
1. Create individual goals (each in DRAFT)
2. Ensure total weightage = 100% exactly
3. Click **"Submit All Goals"** button to send to manager
4. Wait for manager/admin approval

---

## Testing Checklist

### Test Case 1: Employee Submits Goal (for Manager)
1. ✅ Login as **employee@company.com** / password123
2. ✅ Go to **My Goals** page
3. ✅ Create 3-5 new goals (each 20-33% weightage, total = 100%)
4. ✅ Click **"Submit All Goals"**
5. ✅ Logout

6. ✅ Login as **manager@company.com** / password123
7. ✅ Go to **Approvals** page
8. ✅ You should see the submitted goals from employee
9. ✅ Click **"Approve"** on a goal
10. ✅ Goal status should change to **APPROVED**

### Test Case 2: Admin Reviews All Goals
1. ✅ Create goals as employee (as above)
2. ✅ Login as **admin@company.com** / password123
3. ✅ Go to **Approvals** page
4. ✅ You should see **ALL** submitted goals (not just direct reports)
5. ✅ Approve/Reject goals

### Test Case 3: View in Team Goals (Manager)
1. ✅ After employee submits and manager approves
2. ✅ Go to **Team Goals** page (as manager)
3. ✅ Filter by status and see approved goals
4. ✅ Search for goals by employee name

---

## Database Relationships

```
Employee (DRAFT goals) 
    ↓ (Submit all goals)
Employee (SUBMITTED goals)
    ↓ (Manager approves)
Manager (sees in Approvals page)
    ↓ (Approval action)
Employee (APPROVED goals)
    ↓
Admin (sees all goals)
```

---

## Common Mistakes

❌ **Goal not showing in manager's page?**
- Employee needs to **SUBMIT** the goal first (not just create)
- Weightage must total exactly **100%**
- Employee must have manager assigned (reportingManagerId set)

❌ **Weightage validation error?**
- Check: Sum of all goal weightages = 100% (not 99% or 101%)
- Minimum weightage per goal = 10%

❌ **Only seeing DRAFT goals?**
- Click **"Submit All Goals"** button at the bottom
- This converts DRAFT → SUBMITTED

---

## Status Values

| Status | Visible To | Next Step |
|--------|-----------|-----------|
| DRAFT | Employee only | Employee submits |
| SUBMITTED | Manager/Admin | Manager/Admin approves/rejects |
| APPROVED | Everyone | Goal is locked, check-ins begin |
| REJECTED | Employee | Employee revises and resubmits |
| LOCKED | Everyone (read-only) | Check-in updates allowed |

