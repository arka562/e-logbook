# 📋 E-Logbook — Adani Power Limited Shift Operations Management System

A full-stack web application that **digitizes industrial shift operations** for power plants — replacing manual paper registers with a role-based digital platform for shift logging, issue tracking, parameter monitoring, handover management, PDF reporting, analytics, and ML-based anomaly detection.

---

## 🚀 Project Overview

Industrial control rooms and plant operations rely heavily on shift handover registers, operational logs, and issue trackers — traditionally maintained on paper. This system replaces that with a structured, role-controlled digital workflow where:

- **Operators** log events, parameter readings, and issues during a shift
- **Shift In-Charges** supervise, add handover notes, and submit shifts
- **HODs** review and approve shift records
- **Admins** configure the system, view audit logs, and manage plants

---

## 📁 Project Structure

```
e-logbook/
│
├── elogbook-backend/          # Node.js + Express REST API
│   ├── config/                # DB connection
│   ├── controllers/           # Business logic
│   ├── middleware/            # Auth middleware
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API route definitions
│   ├── scripts/               # Demo data seeder
│   ├── utils/                 # PDF generator, audit logger
│   ├── validations/           # Joi validation schemas
│   └── server.js              # Entry point
│
├── elogbook-frontend/         # React + Vite SPA
│   └── src/
│       ├── api/               # Axios API calls
│       ├── components/        # Reusable UI components
│       └── pages/             # Application pages
│
├── elogbook-ml/               # Python ML module
│   └── anomaly.py             # Anomaly detection script
│
└── PROJECT_REPORT.md          # Detailed project documentation
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router, Axios, Chart.js |
| Backend | Node.js, Express.js, JWT, bcryptjs, Joi, PDFKit |
| Database | MongoDB, Mongoose |
| ML Module | Python (anomaly detection, spawned as subprocess) |

---

## 👥 User Roles & Access

| Role | Capabilities |
|---|---|
| **Admin** | Full access — manage plants, departments, units, parameter templates, audit logs, reports |
| **HOD** | Approve/lock shifts, view date-range reports, audit logs |
| **Shift In-Charge** | Create/submit/approve shifts, add handover notes, manage events & issues |
| **Operator** | Add parameter readings, events, issues, submit draft shifts |

---

## ⚙️ Core Features

### 🔄 Shift Lifecycle Management
Shifts follow a controlled workflow:
```
Draft → Submitted → Approved → Locked
```
Once locked, a shift becomes an immutable official record.

### 📊 Parameter Monitoring
- Admin configures dynamic parameter templates per plant (e.g. Boiler Pressure, Generator Voltage, Transformer Oil Temp)
- Operators enter Unit 1 & Unit 2 readings per shift
- System highlights values that fall outside min/max safety limits

### 🗒️ Event Logging
Operational events (load changes, inspections, trips, field rounds) are logged against each shift with timestamps and user attribution.

### 🚨 Issue Tracking
```
Open → WIP → Closed (with mandatory closure remarks)
```
Issues carry priority levels (Low / Medium / High / Critical) and are tied to departments and equipment.

### 🤝 Handover Notes
Shift In-Charge records handover remarks covering pending tasks, safety instructions, and equipment observations. Notes become read-only after the shift is locked.

### 📄 Reports & PDF Export
- **Shift Report** — full breakdown of parameters, events, issues, and handover for a single shift
- **Date-Range Report** — cross-shift summary filterable by plant, unit, issue status, and parameter category
- **PDF Export** — downloadable shift reports generated with PDFKit

### 📈 Dashboard & Pending Work
Live metrics: shifts today, open/WIP/closed issues, events today, parameter entries. A Pending Work panel surfaces critical open issues, missing handovers, pending approvals, and unresolved issues older than 24 hours.

### 🔍 Audit Logs
Every significant action (create, submit, approve, lock, handover update) is logged with user, role, IP address, and old/new data for full traceability.

### 🤖 ML & Anomaly Detection
- Backend fetches parameter entry history from MongoDB
- Spawns a Python subprocess running `anomaly.py`
- Results displayed in the frontend Anomaly View
- **Predictive Maintenance** — equipment risk levels (Low / Medium / High) derived from issue frequency per equipment

---

## 🔌 API Reference

| Group | Key Endpoints |
|---|---|
| Auth | `POST /api/auth/login`, `POST /api/auth/register` |
| Admin | `CRUD /api/admin/plants`, `/departments`, `/units` |
| Shifts | `POST/GET /api/shifts`, `PUT .../submit`, `.../approve`, `.../lock` |
| Parameters | `POST/GET /api/parameters/templates` |
| Entries | `POST /api/entries` |
| Events | `POST /api/events` |
| Issues | `POST/GET/PATCH /api/issues` |
| Reports | `GET /api/reports/shift/:id`, `/pdf`, `/range` |
| Dashboard | `GET /api/dashboard` |
| Analytics | `GET /api/analytics/parameters`, `/trends`, `/efficiency`, `/issues` |
| Audit | `GET /api/audit` |
| ML | `GET /api/ml/anomaly`, `/predictive-maintenance` |

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Python 3.8+ (for ML module)

### Backend

```bash
cd elogbook-backend
npm install
# Create a .env file with:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
npm run dev
```

### Frontend

```bash
cd elogbook-frontend
npm install
npm run dev
```

### ML Module

```bash
cd elogbook-ml
pip install -r requirements.txt
```

---

## 🌱 Demo Data

A seed script generates a realistic dataset for testing:

```bash
cd elogbook-backend
npm run seed:demo

# To reset and recreate:
npm run seed:demo -- --reset-demo
```

**What gets created:** 3 plants, 12 departments, 9 units, 5 users, 36 parameter templates, 126 shifts, 1,512 parameter entries, ~378 events, ~126 issues, audit logs, handover notes.

### Demo Login Credentials

| Role | Email |
|---|---|
| Admin | `demo.admin@eoperationsrecord.test` |
| HOD | `demo.hod@eoperationsrecord.test` |
| Shift In-Charge | `demo.incharge@eoperationsrecord.test` |
| Operator 1 | `demo.operator1@eoperationsrecord.test` |
| Operator 2 | `demo.operator2@eoperationsrecord.test` |

**Password for all:** `Password@123`

---

## 🔮 Future Scope

- Excel export for date-range reports
- Email / WhatsApp notifications for critical issues
- File & photo attachments for issues
- Real-time WebSocket notifications
- Digital signatures for shift approval
- Mobile-responsive optimization
- Offline data entry support
- Multi-plant permission matrix

---

## 📄 License

Open source. See repository for details.

---

## 👤 Author

**Arka** — [@arka562](https://github.com/arka562)
