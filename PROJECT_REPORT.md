# Adani Power Limited Project Report

## 1. Project Title

**Adani Power Limited Shift Operations Management System**

This project is a full-stack web application designed to digitize industrial shift logging, operational reporting, issue tracking, handover communication, parameter monitoring, analytics, audit tracking, and basic machine learning assisted maintenance/anomaly insights.

The system replaces manual operational registers used in plants, units, and control rooms with a role-based digital platform where operators, shift in-charges, HODs, and administrators can work through a controlled shift lifecycle.

---

## 2. Project Objective

The main objective of this project is to provide a centralized platform for managing industrial shift operations.

The system helps users:

- Create and manage plant shift records.
- Record operational events during a shift.
- Record parameter readings for different plant systems.
- Track issues raised during operations.
- Maintain handover notes between shifts.
- Approve, lock, and preserve shift records.
- Generate shift-wise and date-range reports.
- Export shift reports as PDF.
- Track activity through audit logs.
- Monitor pending work from the dashboard.
- Use analytics and ML modules for operational insights.

The project focuses on improving accuracy, accountability, traceability, and visibility in plant operations.

---

## 3. Technology Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Chart.js
- React Chart.js 2
- Inline styling based UI components

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcryptjs password hashing
- Joi validation
- PDFKit for PDF generation
- Nodemon for development

### ML Module

- Python
- Local anomaly detection script
- Backend spawns Python process for ML response

### Database

- MongoDB

---

## 4. High-Level Architecture

The application follows a standard full-stack architecture.

```text
Frontend React App
        |
        | Axios API calls
        v
Express Backend API
        |
        | Mongoose ODM
        v
MongoDB Database
        |
        | Optional Python execution
        v
ML Script for anomaly detection
```

### Main Folders

```text
eoperations record-backend/
  config/
  controllers/
  middleware/
  models/
  routes/
  scripts/
  utils/
  validations/
  server.js

eoperations record-frontend/
  src/
    api/
    components/
    pages/
    App.jsx
    main.jsx

eoperations record-ml/
  anomaly.py
```

---

## 5. User Roles

The system supports role-based access control.

### Admin

Admin has the highest level of access.

Admin can:

- Create parameter templates.
- Create/manage plants, departments, and units through backend APIs.
- Create shifts.
- View reports.
- View audit logs.
- Lock/approve flows where allowed.
- Access dashboard and analytics.

### HOD

HOD is responsible for higher-level approval and review.

HOD can:

- View shifts.
- Approve or lock shifts depending on workflow.
- View date-range reports.
- View audit logs.
- Review operational data.

### Shift In-Charge

Shift in-charge is responsible for shift-level supervision.

Shift in-charge can:

- Create shifts.
- Submit/approve shifts depending on configured workflow.
- Add or review handover notes.
- Add events and issues.
- View reports and date-range reports.

### Operator

Operator is responsible for daily operational data entry.

Operator can:

- Create shifts.
- Add parameter readings.
- Add events.
- Add issues.
- Submit draft shifts.
- View assigned operational data.

---

## 6. Authentication System

The authentication system uses email and password login.

### Backend Authentication

Files:

- `eoperations record-backend/controllers/authController.js`
- `eoperations record-backend/routes/authRoutes.js`
- `eoperations record-backend/models/User.model.js`
- `eoperations record-backend/middleware/authMiddleware.js`

### Main Concepts

- Passwords are hashed using `bcryptjs`.
- JWT tokens are generated after login.
- Token is stored in frontend localStorage.
- Axios automatically sends token in the `Authorization` header.
- Protected backend routes use auth middleware.

### User Model

Fields:

- `name`
- `email`
- `password`
- `role`
- `department`

Roles:

- `operator`
- `shift_incharge`
- `hod`
- `admin`

---

## 7. Backend Server Setup

Main file:

- `eoperations record-backend/server.js`

Responsibilities:

- Loads environment variables.
- Connects to MongoDB.
- Enables CORS.
- Enables JSON request parsing.
- Mounts all API routes.
- Starts server on port `5000` by default.

Important base API paths:

```text
/api/auth
/api/admin
/api/shifts
/api/parameters
/api/events
/api/issues
/api/dashboard
/api/audit
/api/reports
/api/entries
/api/analytics
/api/ml
```

---

## 8. Database Models

### User Model

File:

- `models/User.model.js`

Stores application users and their roles.

Important fields:

- Name
- Email
- Password
- Role
- Department

---

### Plant Model

File:

- `models/Plant.model.js`

Stores plant information.

Important fields:

- `name`
- `location`

---

### Department Model

File:

- `models/Department.model.js`

Stores departments linked to a plant.

Important fields:

- `name`
- `plant`

---

### Unit Model

File:

- `models/Unit.model.js`

Stores plant units.

Important fields:

- `name`
- `plant`
- `department`
- `capacity`

---

### Shift Model

File:

- `models/Shift.model.js`

Stores shift records and workflow state.

Important fields:

- `date`
- `shiftType`
- `plant`
- `unit`
- `shiftInCharge`
- `engineers`
- `status`
- `submittedBy`
- `submittedAt`
- `approvedBy`
- `approvedAt`
- `lockedBy`
- `lockedAt`
- `handoverRemarks`

Shift statuses:

- `draft`
- `submitted`
- `approved`
- `locked`
- `closed`

---

### Parameter Template Model

File:

- `models/ParameterTemplate.model.js`

Stores configurable parameters for each plant.

Important fields:

- `name`
- `category`
- `unit`
- `designValue`
- `minValue`
- `maxValue`
- `plant`
- `createdBy`

Categories:

- `shift_parameters`
- `electrical`
- `switchyard`
- `fire_system`
- `equipment_status`

Purpose:

- Allows admin to define dynamic parameters without code changes.
- Supports min/max safety limits.
- Used for operational readings and alerts.

---

### Parameter Entry Model

File:

- `models/ParameterEntry.mode.js`

Stores parameter readings entered during a shift.

Important fields:

- `shiftId`
- `parameterId`
- `unit1Value`
- `unit2Value`

Purpose:

- Captures actual values against parameter templates.
- Used in shift reports, date-range reports, analytics, and anomaly detection.

---

### Event Log Model

File:

- `models/EventLog.model.js`

Stores events recorded during a shift.

Important fields:

- `shift`
- `unit`
- `description`
- `createdBy`

Purpose:

- Records operational events such as load changes, inspections, trips, observations, and shift activities.

---

### Issue Model

File:

- `models/Issue.model.js`

Stores issues raised during shift operations.

Important fields:

- `shift`
- `unit`
- `department`
- `equipment`
- `description`
- `priority`
- `status`
- `createdBy`
- `resolvedBy`
- `resolvedAt`
- `closureRemarks`

Priorities:

- `low`
- `medium`
- `high`
- `critical`

Statuses:

- `open`
- `wip`
- `closed`

Purpose:

- Tracks operational problems, department responsibility, criticality, progress, and closure remarks.

---

### Audit Log Model

File:

- `models/AuditLog.model.js`

Stores traceable system actions.

Important fields:

- `action`
- `module`
- `entityId`
- `user`
- `userRole`
- `description`
- `oldData`
- `newData`
- `ipAddress`

Purpose:

- Provides accountability.
- Tracks workflow actions like create, submit, approve, lock, and handover updates.

---

## 9. Core Functional Modules

## 9.1 Shift Management

Files:

- `controllers/shiftController.js`
- `routes/shiftRoutes.js`
- `models/Shift.model.js`
- `frontend/src/pages/CreateShift.jsx`
- `frontend/src/pages/ShiftLists.jsx`
- `frontend/src/pages/ShiftDetails.jsx`

### Features

- Create new shifts.
- Prevent duplicate shifts for same date, unit, and shift type.
- Show list of shifts.
- Filter shifts by date, unit, and status.
- Open shift details.
- Submit shift.
- Approve shift.
- Lock shift.
- Prevent edits after locking.

### Workflow

```text
Draft -> Submitted -> Approved -> Locked
```

### Why This Is Important

In industrial operations, shift records must follow a controlled workflow. A draft can be edited, but once submitted, approved, and locked, it becomes an official record.

---

## 9.2 Shift Handover Notes

Files:

- `models/Shift.model.js`
- `controllers/shiftController.js`
- `routes/shiftRoutes.js`
- `frontend/src/pages/ShiftDetails.jsx`
- `frontend/src/pages/ReportView.jsx`
- `utils/pdfGenerator.js`

### Features

- Operators or shift in-charge can enter handover remarks.
- Handover notes are saved inside the shift.
- Notes become read-only after shift is locked or closed.
- Handover appears in:
  - Shift details
  - Shift report
  - PDF export
  - Pending work dashboard if missing

### Purpose

Handover notes help the next shift understand:

- Pending issues
- Safety instructions
- Equipment under observation
- Operational changes
- Important remarks

---

## 9.3 Parameter Template Management

Files:

- `models/ParameterTemplate.model.js`
- `controllers/parameterController.js`
- `routes/parameterRoutes.js`
- `frontend/src/pages/ParameterTemplate.jsx`

### Features

- Admin can create plant-wise parameters.
- Parameters can be grouped by category.
- Each parameter can have:
  - Unit
  - Design value
  - Min safe value
  - Max safe value

### Purpose

Instead of hardcoding plant parameters, the system allows parameters to be configured dynamically.

Example parameters:

- Boiler Pressure
- Main Steam Temperature
- Generator Voltage
- Transformer Oil Temperature
- Fire Pump Pressure
- Cooling Tower Fan Status

---

## 9.4 Parameter Entry and Min/Max Alerts

Files:

- `models/ParameterEntry.mode.js`
- `controllers/entryController.js`
- `routes/entryRoutes.js`
- `frontend/src/pages/ShiftDetails.jsx`
- `frontend/src/pages/ReportView.jsx`
- `utils/pdfGenerator.js`

### Features

- Operators enter readings for each parameter.
- Supports Unit 1 and Unit 2 values.
- Values are compared with min/max limits.
- UI shows:
  - Within range
  - Below min
  - Above max
  - Text value
- Report shows:
  - Safe range
  - Actual values
  - Normal or Out of range status
- PDF also includes safe range and status.

### Purpose

This improves operational safety by highlighting abnormal readings immediately.

---

## 9.5 Event Logging

Files:

- `models/EventLog.model.js`
- `controllers/eventController.js`
- `routes/eventRoutes.js`
- `frontend/src/pages/ShiftDetails.jsx`
- `frontend/src/pages/ReportView.jsx`

### Features

- Add event description during a shift.
- Event is linked to shift and unit.
- Event records who created it.
- Events appear in:
  - Shift details
  - Shift report
  - Date-range report
  - PDF export

### Example Events

- Shift takeover completed.
- Load adjusted as per grid demand.
- Field round completed.
- Standby pump trial completed.
- Abnormal vibration observed.

---

## 9.6 Issue Tracking

Files:

- `models/Issue.model.js`
- `controllers/issueController.js`
- `routes/issueRoutes.js`
- `frontend/src/pages/ShiftDetails.jsx`
- `frontend/src/pages/ReportView.jsx`
- `utils/pdfGenerator.js`

### Features

- Add issue during shift.
- Select department.
- Set issue priority.
- Track issue status.
- Move issue from open to WIP.
- Close issue with required closure remarks.
- Store resolved by and resolved at.

### Priority Levels

- Low
- Medium
- High
- Critical

### Status Flow

```text
Open -> WIP -> Closed
```

### Closure Remarks

Closure remarks are required before closing an issue. This ensures issues cannot be closed without explanation.

---

## 9.7 Shift Report

Files:

- `controllers/reportController.js`
- `routes/reportRoutes.js`
- `frontend/src/pages/ReportView.jsx`
- `utils/pdfGenerator.js`

### Features

Generates a complete report for a selected shift.

Report includes:

- Shift information
- Plant
- Unit
- Shift type
- Date
- Status
- Handover notes
- Parameter readings
- Safe ranges
- Parameter alert status
- Events
- Issues
- Issue priority
- Issue status
- Closure remarks

### PDF Export

The system uses PDFKit to generate shift PDF reports.

PDF includes:

- Shift information
- Handover notes
- Parameters
- Events
- Issues
- Generated timestamp

---

## 9.8 Date-Range Reports

Files:

- `controllers/reportController.js`
- `routes/reportRoutes.js`
- `frontend/src/pages/DateRangeReport.jsx`
- `frontend/src/App.jsx`
- `frontend/src/pages/MainLayout.jsx`

### Features

Allows admin, HOD, and shift in-charge to generate reports across multiple shifts.

Filters:

- Start date
- End date
- Plant
- Unit
- Issue status
- Parameter category

Report summary includes:

- Total shifts
- Total parameter entries
- Total events
- Total issues

Tables include:

- Shifts
- Issues
- Events

### Purpose

This is useful for management-level review across days, plants, and units.

---

## 9.9 Dashboard

Files:

- `controllers/dashboardController.js`
- `routes/dashboardRoutes.js`
- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/components/Card.jsx`

### Existing Metrics

Dashboard shows:

- Shifts today
- Open issues
- WIP issues
- Closed issues
- Events today
- Parameter entries today

### Chart

The dashboard includes a pie chart showing issue status distribution.

### Quick Metrics

Dashboard also shows:

- Operational load
- Open issue ratio
- Recent activity
- Parameter logging

---

## 9.10 Pending Work Panel

Files:

- `controllers/dashboardController.js`
- `frontend/src/pages/Dashboard.jsx`

### Features

The dashboard includes a pending work section showing:

- Pending approvals
- Critical open issues
- Missing handovers
- Unresolved issues older than 24 hours

### Purpose

This works like an internal notification/action queue. It helps users quickly identify work that needs attention.

---

## 9.11 Audit Log

Files:

- `models/AuditLog.model.js`
- `utils/auditLogger.js`
- `controllers/auditController.js`
- `routes/auditRoutes.js`
- `frontend/src/pages/AuditLog.jsx`
- `frontend/src/App.jsx`
- `frontend/src/pages/MainLayout.jsx`

### Features

Admin and HOD can view audit logs.

Audit log filters:

- Action
- Module
- User role

Audit table shows:

- Time
- Action
- Module
- User
- Role
- Description
- IP address

### Purpose

Audit logs provide accountability and traceability for important actions.

---

## 9.12 Analytics

Files:

- `controllers/analyticsController.js`
- `routes/analyticsRoute.js`
- `frontend/src/pages/Analytics.jsx`

### Purpose

Analytics helps summarize operational data and identify trends.

The analytics module supports views such as:

- Parameter trends
- Efficiency related summaries
- Issue statistics
- Available parameters for trend selection

---

## 9.13 ML and Anomaly Detection

Files:

- `controllers/mlController.js`
- `routes/mlRoute.js`
- `eoperations record-ml/anomaly.py`
- `frontend/src/pages/AnomalyView.jsx`
- `frontend/src/components/PredictiveMaintenance.jsx`

### Features

- Detect anomalies from parameter history.
- Predictive maintenance summary based on issue count.
- Equipment risk categories:
  - Low
  - Medium
  - High

### How It Works

- Backend fetches parameter entries from MongoDB.
- Numeric values are extracted.
- Backend spawns a Python script.
- Python script returns anomaly output.
- Frontend displays the result.

### Predictive Maintenance

Predictive maintenance is based on issue frequency per equipment. More frequent issues increase risk level.

---

## 10. Frontend Pages

### Login Page

File:

- `frontend/src/pages/Login.jsx`

Purpose:

- Allows users to login.
- Stores token and user role in localStorage.
- Redirects user to dashboard.

---

### Register Page

File:

- `frontend/src/pages/Register.jsx`

Purpose:

- Allows user registration.

---

### Main Layout

File:

- `frontend/src/pages/MainLayout.jsx`

Purpose:

- Provides sidebar navigation.
- Displays user name and role.
- Handles logout.
- Shows links based on role.

Navigation includes:

- Dashboard
- Shift List
- Create Shift
- Analytics
- Range Reports
- Parameters
- ML Anomaly
- Audit Log

---

### Dashboard Page

File:

- `frontend/src/pages/Dashboard.jsx`

Purpose:

- Shows operational summary.
- Shows chart.
- Shows pending work panel.
- Gives quick navigation actions.

---

### Create Shift Page

File:

- `frontend/src/pages/CreateShift.jsx`

Purpose:

- Allows shift creation.
- Select plant and unit.
- Add engineer details.

---

### Shift List Page

File:

- `frontend/src/pages/ShiftLists.jsx`

Purpose:

- Shows shifts.
- Allows filtering.
- Allows opening shift details.
- Allows workflow actions based on role and status.
- Allows report and PDF actions.

---

### Shift Details Page

File:

- `frontend/src/pages/ShiftDetails.jsx`

Purpose:

- Shows detailed shift operations record.
- Add events.
- Add issues.
- Add handover notes.
- Add parameter readings.
- Update issue status.
- Close issues with remarks.

---

### Report View Page

File:

- `frontend/src/pages/ReportView.jsx`

Purpose:

- Shows complete report for one shift.
- Displays parameters, events, issues, handover notes.
- Shows parameter alert status.
- Allows PDF download.

---

### Parameter Template Page

File:

- `frontend/src/pages/ParameterTemplate.jsx`

Purpose:

- Allows admin to create parameter templates.
- Add design value, min value, and max value.
- View existing templates.

---

### Date Range Report Page

File:

- `frontend/src/pages/DateRangeReport.jsx`

Purpose:

- Generate reports for a date range.
- Filter by plant, unit, issue status, and parameter category.

---

### Audit Log Page

File:

- `frontend/src/pages/AuditLog.jsx`

Purpose:

- Admin/HOD can view audit trail.
- Filter logs by action, module, and role.

---

### Analytics Page

File:

- `frontend/src/pages/Analytics.jsx`

Purpose:

- Shows analytics and trends.

---

### ML Anomaly Page

File:

- `frontend/src/pages/AnomalyView.jsx`

Purpose:

- Allows anomaly detection based on parameter data.

---

## 11. API Summary

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Admin

```text
GET    /api/admin/plants
POST   /api/admin/plant
DELETE /api/admin/plants/:id

GET    /api/admin/departments
POST   /api/admin/department
GET    /api/admin/plants/:plantId/departments

GET    /api/admin/units
POST   /api/admin/unit
GET    /api/admin/departments/:departmentId/units
```

### Shifts

```text
POST  /api/shifts
GET   /api/shifts
GET   /api/shifts/:id
PUT   /api/shifts/submit/:shiftId
PUT   /api/shifts/approve/:shiftId
PUT   /api/shifts/lock/:shiftId
PATCH /api/shifts/:shiftId/handover
```

### Parameters

```text
POST /api/parameters/templates
GET  /api/parameters/templates
```

### Entries

```text
POST /api/entries
```

### Events

```text
POST /api/events
```

### Issues

```text
POST   /api/issues
GET    /api/issues/shift/:shiftId
PATCH  /api/issues/:issueId/status
DELETE /api/issues/:issueId
```

### Dashboard

```text
GET /api/dashboard
```

### Reports

```text
GET /api/reports/shift/:shiftId
GET /api/reports/shift/:shiftId/pdf
GET /api/reports/range
```

### Audit

```text
GET /api/audit
```

### Analytics

```text
GET /api/analytics/parameters
GET /api/analytics/trends
GET /api/analytics/efficiency
GET /api/analytics/issues
```

### ML

```text
GET /api/ml/anomaly
GET /api/ml/predictive-maintenance
```

---

## 12. Demo Data Seeder

File:

- `eoperations record-backend/scripts/seedDemoData.js`

NPM command:

```text
npm run seed:demo
```

Reset and recreate:

```text
npm run seed:demo -- --reset-demo
```

### Demo Data Created

The seed script creates:

- 3 plants
- 12 departments
- 9 units
- 5 users
- 36 parameter templates
- 126 shifts
- 1512 parameter entries
- Around 378 events
- Around 126 issues
- Audit logs
- Handover notes
- Missing handovers
- Critical issues
- Old unresolved issues

### Demo Login Credentials

Password for all demo users:

```text
Password@123
```

Users:

```text
admin: demo.admin@eoperations record.test
hod: demo.hod@eoperations record.test
shift_incharge: demo.incharge@eoperations record.test
operator: demo.operator1@eoperations record.test
operator: demo.operator2@eoperations record.test
```

---

## 13. End-to-End Workflow

### Step 1: Login

User logs in using email and password.

### Step 2: Create Shift

Operator or shift in-charge creates a shift.

### Step 3: Add Operational Data

Inside shift details:

- Add events.
- Add parameter readings.
- Add issues.
- Add handover notes.

### Step 4: Submit Shift

Operator submits the shift.

### Step 5: Approve Shift

Shift in-charge or authorized user approves the shift.

### Step 6: Lock Shift

HOD or admin locks the shift.

### Step 7: Generate Report

User opens shift report or downloads PDF.

### Step 8: Review Dashboard

Dashboard shows live counts and pending work.

### Step 9: Review Audit Logs

Admin/HOD can check who performed important actions.

---

## 14. Security and Access Control

### Authentication

- JWT based authentication.
- Token required for protected routes.

### Authorization

- Role-based route protection in backend.
- Role-based protected routes in frontend.

### Password Security

- Passwords are hashed with bcrypt.

### Workflow Security

- Locked shifts cannot be modified.
- Closed issues cannot be modified.
- Closure remarks required before issue closure.
- Handover cannot be edited after lock/close.

---

## 15. Validation and Error Handling

### Examples

- Shift creation checks required fields.
- Shift duplicate prevention.
- Unit and plant relationship validation.
- Parameter min/max validation.
- Issue priority validation.
- Closure remarks validation.
- Date-range report validates date inputs.
- Auth middleware validates token.

---

## 16. Testing Strategy

### Manual Testing Areas

1. Login with each role.
2. Create shift.
3. Add parameter readings.
4. Check min/max alerts.
5. Add event.
6. Add issue with priority.
7. Mark issue WIP.
8. Close issue with remarks.
9. Add handover.
10. Submit shift.
11. Approve shift.
12. Lock shift.
13. View shift report.
14. Download PDF.
15. View date-range report.
16. View dashboard pending work.
17. View audit logs.
18. Test ML anomaly page.
19. Test predictive maintenance.

### Automated Checks Used During Development

Frontend build:

```text
npm run build
```

Frontend lint:

```text
npm run lint
```

Backend syntax check:

```text
node --check file.js
```

---

## 17. Current Known Warnings

Frontend lint currently has hook dependency warnings in some pages.

These are not build-breaking errors, but they can be cleaned later for better code quality.

Examples:

- `AnomalyView.jsx`
- `Dashboard.jsx`
- `ParameterTemplate.jsx`
- `ShiftDetails.jsx`
- `ShiftLists.jsx`

---

## 18. Strengths of This Project

This project is strong because it includes:

- Real industrial workflow.
- Role-based access.
- Dynamic parameter system.
- Shift lifecycle.
- Event and issue logging.
- Handover management.
- Reports and PDF.
- Date-range management reporting.
- Audit logs.
- Dashboard with pending work.
- Analytics.
- ML integration.
- Large demo dataset.

It is more than a simple CRUD application. It demonstrates a complete operational management workflow.

---

## 19. Future Scope

Possible future improvements:

- Excel export.
- Email or WhatsApp notifications.
- File/photo attachments for issues.
- Advanced charts.
- Admin user management UI.
- More advanced anomaly detection.
- Realtime WebSocket notifications.
- Mobile responsive optimization.
- Offline data entry support.
- Digital signatures for shift approval.
- Multi-plant permission matrix.

---

## 20. Conclusion

The Adani Power Limited project is a complete full-stack system for managing plant shift operations. It provides shift creation, operational logging, issue tracking, handover communication, parameter monitoring, reporting, audit logging, analytics, and ML-based insights.

The system improves transparency, reduces dependency on manual registers, and creates a structured workflow for industrial operations. With role-based access and audit tracking, it also supports accountability and management-level supervision.

This project is suitable for demonstration as a real-world industrial operations management platform.

