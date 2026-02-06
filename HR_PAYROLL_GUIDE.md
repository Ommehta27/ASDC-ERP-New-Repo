# 👥 HR & Payroll Module - Complete Guide

## 📋 Overview

The HR & Payroll module is a comprehensive enterprise-grade system for managing the complete employee lifecycle from onboarding to exit clearance.

---

## 🗂️ Module Structure

### **Pages** (`app/(dashboard)/hr/`)
- ✅ **Employees** - Employee master data management
- ✅ **Attendance** - Daily attendance tracking
- ✅ **Leaves** - Leave application and approval
- ✅ **Payroll** - Salary processing and management
- ✅ **Performance** - Performance reviews and appraisals
- ✅ **Training** - Training programs and enrollments
- ✅ **Onboarding** - New employee onboarding tasks
- ✅ **Exit** - Exit clearance and offboarding

### **API Routes** (`app/api/hr/`)
- ✅ `GET/POST /api/hr/employees` - Employee CRUD
- ✅ `GET/PUT/DELETE /api/hr/employees/[id]` - Individual employee
- ✅ `GET/POST /api/hr/attendance` - Attendance management
- ✅ `GET/POST /api/hr/leaves` - Leave applications
- ✅ `GET/POST /api/hr/payroll` - Payroll processing
- ✅ `GET/POST /api/hr/performance` - Performance reviews
- ✅ `GET/POST /api/hr/training` - Training programs
- ✅ `GET/POST /api/hr/onboarding` - Onboarding tasks
- ✅ `GET/POST /api/hr/exit` - Exit clearance

### **Components** (`components/hr/`)
- ✅ `employee-form.tsx` - 5-tab employee creation form
- ✅ `employees-table.tsx` - Employee listing with filters
- ✅ `attendance-calendar.tsx` - Calendar view for attendance
- ✅ `attendance-stats.tsx` - Attendance statistics
- ✅ `leave-applications-table.tsx` - Leave requests table
- ✅ `leave-stats.tsx` - Leave balance and statistics
- ✅ `payroll-table.tsx` - Payroll records table
- ✅ `payroll-stats.tsx` - Payroll summary statistics
- ✅ `performance-reviews-table.tsx` - Performance reviews
- ✅ `training-programs-table.tsx` - Training programs
- ✅ `onboarding-table.tsx` - Onboarding progress
- ✅ `exit-clearance-table.tsx` - Exit clearance tracking

---

## 🎯 Features

### 1. **Employee Management**

#### Employee Master Data
- **Personal Information**: Name, DOB, Gender, Blood Group
- **Employment Details**: Code, Designation, Department, Type, Status
- **Contact Information**: Email, Phone, Address
- **Reporting Structure**: Reporting Manager, Center Assignment
- **Financial**: Approval Limits, PO Approval Rights
- **Documents**: Aadhar, PAN, Resume, Certificates

#### Employee Types
- `FULL_TIME` - Regular full-time employees
- `PART_TIME` - Part-time employees
- `CONTRACT` - Contract-based employees
- `INTERN` - Interns and trainees
- `CONSULTANT` - External consultants

#### Employment Status
- `ACTIVE` - Currently working
- `ON_LEAVE` - On extended leave
- `SUSPENDED` - Temporarily suspended
- `TERMINATED` - Employment terminated
- `RESIGNED` - Employee resigned

---

### 2. **Attendance Management**

#### Features
- ✅ Daily check-in/check-out tracking
- ✅ Work hours calculation
- ✅ Late arrival tracking
- ✅ Early leave detection
- ✅ Overtime calculation
- ✅ Location-based attendance
- ✅ Calendar view
- ✅ Monthly reports

#### Attendance Status
- `PRESENT` - Employee present
- `ABSENT` - Employee absent
- `HALF_DAY` - Half-day attendance
- `LEAVE` - On approved leave
- `HOLIDAY` - Public holiday
- `WEEK_OFF` - Weekly off

#### API Usage
```typescript
// Mark attendance
POST /api/hr/attendance
{
  "employeeId": "emp_123",
  "date": "2026-02-05",
  "checkIn": "2026-02-05T09:00:00Z",
  "checkOut": "2026-02-05T18:00:00Z",
  "status": "PRESENT"
}

// Get attendance records
GET /api/hr/attendance?employeeId=emp_123&startDate=2026-02-01&endDate=2026-02-28
```

---

### 3. **Leave Management**

#### Leave Types
- Casual Leave (CL)
- Sick Leave (SL)
- Earned Leave (EL)
- Maternity Leave
- Paternity Leave
- Compensatory Off
- Loss of Pay (LOP)

#### Leave Workflow
1. Employee applies for leave
2. Reporting manager approves/rejects
3. HR updates leave balance
4. System tracks leave history

#### Leave Status
- `PENDING` - Awaiting approval
- `APPROVED` - Approved by manager
- `REJECTED` - Rejected by manager
- `CANCELLED` - Cancelled by employee

#### API Usage
```typescript
// Apply for leave
POST /api/hr/leaves
{
  "employeeId": "emp_123",
  "leaveTypeId": "leave_type_1",
  "startDate": "2026-02-10",
  "endDate": "2026-02-12",
  "days": 3,
  "reason": "Personal work"
}

// Get leave applications
GET /api/hr/leaves?employeeId=emp_123&status=PENDING
```

---

### 4. **Payroll Processing**

#### Salary Components
**Earnings:**
- Basic Salary
- House Rent Allowance (HRA)
- Dearness Allowance (DA)
- Conveyance Allowance
- Special Allowance
- Performance Bonus
- Reimbursements

**Deductions:**
- Provident Fund (PF)
- Employee State Insurance (ESI)
- Professional Tax
- Income Tax (TDS)
- Other Deductions

#### Payroll Calculation
```
Gross Salary = Basic Salary + Allowances
Total Deductions = PF + ESI + Tax + Other Deductions
Net Salary = Gross Salary - Total Deductions
```

#### Payroll Status
- `DRAFT` - Being prepared
- `PENDING_APPROVAL` - Awaiting approval
- `APPROVED` - Approved for payment
- `PROCESSED` - Payment processed
- `PAID` - Payment completed
- `FAILED` - Payment failed

#### API Usage
```typescript
// Process payroll
POST /api/hr/payroll
{
  "employeeId": "emp_123",
  "month": 2,
  "year": 2026,
  "basicSalary": 50000,
  "allowances": 15000,
  "deductions": 2000,
  "taxDeducted": 5000,
  "pfDeduction": 6000,
  "esiDeduction": 750
}

// Get payroll records
GET /api/hr/payroll?month=2&year=2026
```

---

### 5. **Performance Management**

#### Review Components
- **Technical Skills** (1-5 rating)
- **Communication** (1-5 rating)
- **Teamwork** (1-5 rating)
- **Punctuality** (1-5 rating)
- **Initiative** (1-5 rating)
- **Overall Rating** (calculated average)

#### Review Process
1. Manager initiates review
2. Self-assessment by employee
3. Manager evaluation
4. Goals setting for next period
5. Final review and sign-off

#### API Usage
```typescript
// Create performance review
POST /api/hr/performance
{
  "employeeId": "emp_123",
  "reviewerId": "emp_456",
  "reviewPeriodStart": "2025-10-01",
  "reviewPeriodEnd": "2026-01-31",
  "technicalSkills": 4.5,
  "communication": 4.0,
  "teamwork": 4.5,
  "punctuality": 5.0,
  "initiative": 4.0,
  "achievements": "Completed 3 major projects...",
  "areasOfImprovement": "Time management...",
  "managerComments": "Excellent performance..."
}
```

---

### 6. **Training Programs**

#### Training Management
- ✅ Program scheduling
- ✅ Trainer assignment
- ✅ Participant enrollment
- ✅ Capacity management
- ✅ Cost tracking
- ✅ Completion tracking

#### Training Status
- `SCHEDULED` - Upcoming training
- `IN_PROGRESS` - Currently running
- `COMPLETED` - Training completed
- `CANCELLED` - Training cancelled

#### API Usage
```typescript
// Create training program
POST /api/hr/training
{
  "title": "Advanced React Training",
  "description": "Deep dive into React hooks and patterns",
  "trainer": "John Doe",
  "duration": 40,
  "durationType": "hours",
  "startDate": "2026-03-01",
  "endDate": "2026-03-05",
  "maxParticipants": 20,
  "cost": 5000
}
```

---

### 7. **Employee Onboarding**

#### Onboarding Tasks
- **Pre-Joining**: Offer letter, background verification
- **Day 1**: ID card, system access, induction
- **Week 1**: Team introduction, policy training
- **Month 1**: Goal setting, mentor assignment
- **Month 3**: Probation review

#### Task Categories
- Documentation
- IT Setup
- Access Provisioning
- Training & Orientation
- Administrative

#### API Usage
```typescript
// Create onboarding task
POST /api/hr/onboarding
{
  "employeeId": "emp_123",
  "taskId": "task_456",
  "status": "PENDING"
}

// Get onboarding progress
GET /api/hr/onboarding?employeeId=emp_123
```

---

### 8. **Exit Clearance**

#### Exit Process
1. **Resignation Submission**: Employee submits resignation
2. **Notice Period**: Employee serves notice period
3. **Knowledge Transfer**: Handover to team
4. **Asset Return**: Return company assets
5. **Document Return**: Return confidential documents
6. **No Dues Clearance**: Clear all pending dues
7. **Exit Interview**: HR conducts exit interview
8. **Final Settlement**: Process final payment

#### Exit Types
- `RESIGNATION` - Voluntary resignation
- `TERMINATION` - Terminated by company
- `RETIREMENT` - Retirement
- `END_OF_CONTRACT` - Contract completion
- `ABSCONDING` - Left without notice

#### Exit Status
- `INITIATED` - Exit process started
- `IN_PROGRESS` - Clearance in progress
- `PENDING_SETTLEMENT` - Awaiting final payment
- `COMPLETED` - Exit process completed

#### API Usage
```typescript
// Initiate exit clearance
POST /api/hr/exit
{
  "employeeId": "emp_123",
  "resignationDate": "2026-02-01",
  "lastWorkingDate": "2026-03-01",
  "reason": "Better opportunity",
  "exitType": "RESIGNATION"
}

// Get exit clearances
GET /api/hr/exit
```

---

## 🔐 Permissions

### View Permissions
- `view_employees` - View employee records
- `view_attendance` - View attendance records
- `view_leave` - View leave applications
- `view_payroll` - View payroll records
- `view_performance` - View performance reviews
- `view_training` - View training programs
- `view_onboarding` - View onboarding tasks
- `view_exit_clearance` - View exit clearances

### Action Permissions
- `create_employees` - Add new employees
- `edit_employees` - Modify employee data
- `delete_employees` - Remove employees
- `mark_attendance` - Mark attendance
- `apply_leave` - Apply for leave
- `approve_leave` - Approve leave requests
- `process_payroll` - Process payroll
- `create_performance_review` - Create reviews
- `create_training` - Create training programs
- `manage_onboarding` - Manage onboarding
- `manage_exit_clearance` - Manage exit process

---

## 📊 Database Schema

### Core Tables
- `employees` - Employee master data
- `attendance` - Daily attendance records
- `leave_applications` - Leave requests
- `leave_types` - Leave type definitions
- `leave_balances` - Employee leave balances
- `payroll` - Payroll records
- `performance_reviews` - Performance evaluations
- `training_programs` - Training programs
- `training_enrollments` - Training participants
- `onboarding_tasks` - Onboarding task templates
- `employee_onboarding` - Employee onboarding progress
- `exit_clearance` - Exit clearance records

---

## 🚀 Usage Examples

### Complete Employee Lifecycle

```typescript
// 1. Add Employee
POST /api/hr/employees
{
  "employeeCode": "EMP001",
  "userId": "user_123",
  "designation": "Software Engineer",
  "department": "Engineering",
  "dateOfJoining": "2026-02-05"
}

// 2. Assign Onboarding Tasks
POST /api/hr/onboarding
{
  "employeeId": "emp_123",
  "taskId": "task_456"
}

// 3. Mark Daily Attendance
POST /api/hr/attendance
{
  "employeeId": "emp_123",
  "date": "2026-02-05",
  "status": "PRESENT"
}

// 4. Apply for Leave
POST /api/hr/leaves
{
  "employeeId": "emp_123",
  "leaveTypeId": "leave_type_1",
  "startDate": "2026-03-01",
  "endDate": "2026-03-03",
  "days": 3
}

// 5. Process Monthly Payroll
POST /api/hr/payroll
{
  "employeeId": "emp_123",
  "month": 2,
  "year": 2026,
  "basicSalary": 50000
}

// 6. Conduct Performance Review
POST /api/hr/performance
{
  "employeeId": "emp_123",
  "reviewerId": "emp_456",
  "overallRating": 4.5
}

// 7. Initiate Exit (if needed)
POST /api/hr/exit
{
  "employeeId": "emp_123",
  "resignationDate": "2026-12-01",
  "lastWorkingDate": "2026-12-31"
}
```

---

## ✅ Testing Checklist

### Employees
- [ ] Add new employee
- [ ] View employee list
- [ ] Edit employee details
- [ ] View employee profile
- [ ] Delete employee

### Attendance
- [ ] Mark attendance
- [ ] View attendance calendar
- [ ] Generate attendance report
- [ ] Track late arrivals
- [ ] Calculate overtime

### Leaves
- [ ] Apply for leave
- [ ] Approve leave request
- [ ] Reject leave request
- [ ] View leave balance
- [ ] Cancel leave

### Payroll
- [ ] Process monthly payroll
- [ ] View payroll records
- [ ] Generate payslips
- [ ] Track deductions
- [ ] Process final settlement

### Performance
- [ ] Create performance review
- [ ] View review history
- [ ] Set goals
- [ ] Track achievements

### Training
- [ ] Create training program
- [ ] Enroll participants
- [ ] Track completion
- [ ] Manage capacity

### Onboarding
- [ ] Assign onboarding tasks
- [ ] Track task completion
- [ ] View onboarding progress

### Exit
- [ ] Initiate exit clearance
- [ ] Track clearance items
- [ ] Process final settlement
- [ ] Complete exit interview

---

## 🎓 Best Practices

1. **Data Accuracy**: Ensure all employee data is accurate and up-to-date
2. **Timely Processing**: Process payroll and attendance on time
3. **Regular Reviews**: Conduct performance reviews regularly
4. **Leave Balance**: Monitor and update leave balances
5. **Compliance**: Follow labor laws and regulations
6. **Data Security**: Protect sensitive employee information
7. **Audit Trail**: Maintain complete audit logs
8. **Backup**: Regular backups of HR data

---

## 📞 Support

**Module Status**: ✅ Fully Operational  
**API Routes**: ✅ All Created  
**Components**: ✅ All Functional  
**Permissions**: ✅ Configured  

---

*Last Updated: February 2026*  
*Version: 1.0.0*  
*Status: Production Ready*
