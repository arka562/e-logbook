<div align="center">

# 🏭 E-Logbook
### Digital Shift Operations & Industrial Monitoring System

*Replacing manual plant registers with a role-based digital workflow — logging, monitoring, reporting, and ML-assisted insights, all in one platform.*

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white&style=flat-square)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white&style=flat-square)
![Express](https://img.shields.io/badge/Server-Express.js-000000?logo=express&logoColor=white&style=flat-square)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white&style=flat-square)
![Python](https://img.shields.io/badge/ML-Python-3776AB?logo=python&logoColor=white&style=flat-square)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white&style=flat-square)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [User Roles & Permissions](#-user-roles--permissions)
- [Shift Lifecycle](#-shift-lifecycle)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Demo Data Seeder](#-demo-data-seeder)
- [API Reference](#-api-reference)
- [Security](#-security)
- [Testing](#-testing)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 🔍 Overview

**E-Logbook** is a full-stack web application built to digitize industrial shift logging for plant operations. It replaces paper-based shift registers with a controlled, role-based digital system covering shift management, parameter monitoring, event and issue tracking, handover communication, audit trails, analytics, and ML-assisted anomaly detection.

It was built to model a real plant operations workflow — the kind used in power generation facilities — where every action (submit, approve, lock) needs to be traceable and accountable.

---

## ✨ Key Features

- 🔐 **Role-based access control** — Admin, HOD, Shift In-Charge, Operator, each with scoped permissions
- 📋 **Shift lifecycle management** — Draft → Submitted → Approved → Locked, with edit-locking after approval
- 📊 **Dynamic parameter templates** — admins define plant-specific parameters with min/max safety limits, no code changes needed
- ⚠️ **Real-time safety alerts** — readings outside safe range are flagged instantly in UI, reports, and PDFs
- 📝 **Event & issue logging** — track operational events and issues with priority levels and closure remarks
- 🔄 **Shift handover notes** — structured communication between outgoing and incoming shifts
- 📈 **Analytics dashboard** — parameter trends, efficiency summaries, issue statistics
- 🧾 **PDF report generation** — full shift reports exportable via PDFKit
- 📅 **Date-range reporting** — cross-shift, cross-plant, cross-unit reports for management review
- 🕵️ **Audit logging** — every critical action (create, submit, approve, lock) is logged with user, role, and IP
- 🤖 **ML-assisted anomaly detection** — Python-based anomaly detection and predictive maintenance risk scoring
- 🌱 **One-command demo data seeder** — spin up realistic test data (plants, shifts, issues, users) instantly

---

## 🧱 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React, Vite, React Router, Axios, Chart.js / React-Chart.js-2 |
| **Backend** | Node.js, Express.js, JWT Auth, bcryptjs, Joi validation, PDFKit |
| **Database** | MongoDB with Mongoose ODM |
| **ML Module** | Python (anomaly detection script, invoked by backend as a child process) |

---

## 🏗️ Architecture

```
┌─────────────────────┐
│   React Frontend     │
│  (Vite + Axios)      │
└──────────┬───────────┘
           │ REST API calls
           ▼
┌─────────────────────┐
│  Express Backend API │
│  (JWT auth, routes,  │
│   controllers)        │
└──────────┬───────────┘
           │ Mongoose ODM
           ▼
┌─────────────────────┐
│   MongoDB Database    │
└──────────┬───────────┘
           │ spawns child process
           ▼
┌─────────────────────┐
│  Python ML Script     │
│  (anomaly detection)  │
└─────────────────────┘
```

---

## 📂 Project Structure

```
e-logbook/
├── elogbook-backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/        # demo data seeder
│   ├── utils/           # PDF generator, audit logger
│   ├── validations/
│   └── server.js
│
├── elogbook-frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── pages/
│       ├── App.jsx
│       └── main.jsx
│
├── elogbook-ml/
│   └── anomaly.py
│
└── PROJECT_REPORT.md
```

---

## 👥 User Roles & Permissions

<table>
<tr><th>Role</th><th>Can Do</th></tr>
<tr><td><b>Admin</b></td><td>Create parameter templates, manage plants/departments/units, create shifts, view reports & audit logs, lock/approve, full dashboard & analytics access</td></tr>
<tr><td><b>HOD</b></td><td>Approve/lock shifts, view date-range reports, view audit logs, review operational data</td></tr>
<tr><td><b>Shift In-Charge</b></td><td>Create shifts, submit/approve per workflow, manage handover notes, add events/issues, view reports</td></tr>
<tr><td><b>Operator</b></td><td>Create shifts, log parameter readings, add events/issues, submit draft shifts</td></tr>
</table>

---

## 🔄 Shift Lifecycle

```
  Draft  ──submit──▶  Submitted  ──approve──▶  Approved  ──lock──▶  Locked
   ✏️ editable          🔍 under review          ✅ confirmed         🔒 read-only
```

Once locked, a shift becomes a permanent, unmodifiable record — closed issues and handover notes are also frozen after this point.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB (local instance or Atlas connection string)
- Python 3.x (for the ML module)

### 1. Clone the repo

```bash
git clone https://github.com/arka562/e-logbook.git
cd e-logbook
```

### 2. Backend setup

```bash
cd elogbook-backend
npm install
# create a .env file — see Environment Variables section below
npm run dev      # starts with nodemon on default port 5000
```

### 3. Frontend setup

```bash
cd elogbook-frontend
npm install
npm run dev      # starts the Vite dev server
```

### 4. ML module

```bash
cd elogbook-ml
pip install -r requirements.txt   # if present
# invoked automatically by the backend's ML controller — no separate server needed
```

---

## 🔑 Environment Variables

Create a `.env` file inside `elogbook-backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

> ⚠️ Never commit your `.env` file. Add it to `.gitignore` if it isn't already there.

---

## 🌱 Demo Data Seeder

Spin up a realistic dataset in one command:

```bash
npm run seed:demo
```

Reset and recreate from scratch:

```bash
npm run seed:demo -- --reset-demo
```

<details>
<summary>📦 What gets created</summary>

- 3 plants, 12 departments, 9 units
- 5 demo users (one per role)
- 36 parameter templates
- 126 shifts with ~1,512 parameter entries
- ~378 events, ~126 issues
- Audit logs, handover notes, missing handovers, critical issues, and aged unresolved issues

</details>

<details>
<summary>🔐 Demo login credentials</summary>

All demo users share the password: `Password@123`

| Role | Email |
|---|---|
| Admin | demo.admin@elogbook.test |
| HOD | demo.hod@elogbook.test |
| Shift In-Charge | demo.incharge@elogbook.test |
| Operator 1 | demo.operator1@elogbook.test |
| Operator 2 | demo.operator2@elogbook.test |

</details>

---

## 📡 API Reference

<details>
<summary><b>🔑 Authentication</b></summary>

```
POST /api/auth/register
POST /api/auth/login
```
</details>

<details>
<summary><b>🛠️ Admin</b></summary>

```
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
</details>

<details>
<summary><b>📋 Shifts</b></summary>

```
POST  /api/shifts
GET   /api/shifts
GET   /api/shifts/:id
PUT   /api/shifts/submit/:shiftId
PUT   /api/shifts/approve/:shiftId
PUT   /api/shifts/lock/:shiftId
PATCH /api/shifts/:shiftId/handover
```
</details>

<details>
<summary><b>📊 Parameters & Entries</b></summary>

```
POST /api/parameters/templates
GET  /api/parameters/templates
POST /api/entries
```
</details>

<details>
<summary><b>📝 Events & Issues</b></summary>

```
POST   /api/events

POST   /api/issues
GET    /api/issues/shift/:shiftId
PATCH  /api/issues/:issueId/status
DELETE /api/issues/:issueId
```
</details>

<details>
<summary><b>📈 Dashboard, Reports, Audit & Analytics</b></summary>

```
GET /api/dashboard

GET /api/reports/shift/:shiftId
GET /api/reports/shift/:shiftId/pdf
GET /api/reports/range

GET /api/audit

GET /api/analytics/parameters
GET /api/analytics/trends
GET /api/analytics/efficiency
GET /api/analytics/issues
```
</details>

<details>
<summary><b>🤖 ML / Anomaly Detection</b></summary>

```
GET /api/ml/anomaly
GET /api/ml/predictive-maintenance
```
</details>

---

## 🛡️ Security

- JWT-based authentication on all protected routes
- Password hashing via `bcryptjs`
- Role-based authorization, enforced on both backend and frontend
- Locked shifts and closed issues are immutable
- Closure remarks are mandatory before an issue can be closed

---

## 🧪 Testing

**Manual testing covers:** login per role, shift creation, parameter entry with min/max alerts, event/issue logging, handover notes, the full submit → approve → lock flow, PDF export, date-range reports, audit logs, and the ML anomaly/predictive maintenance pages.

**Automated checks:**

```bash
npm run build     # frontend build
npm run lint      # frontend lint
node --check file.js   # backend syntax check
```

---

## 🗺️ Roadmap

- [ ] Excel export for reports
- [ ] Email / WhatsApp notifications
- [ ] File and photo attachments for issues
- [ ] Advanced charting
- [ ] Admin user management UI
- [ ] More advanced anomaly detection models
- [ ] Real-time WebSocket notifications
- [ ] Mobile-responsive optimization
- [ ] Offline data entry support
- [ ] Digital signatures for shift approval
- [ ] Multi-plant permission matrix

---

## 🤝 Contributing

This is currently a solo academic/portfolio project. If you'd like to suggest improvements:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a pull request

---

## 📄 License

No license file is currently present in this repo. Add a `LICENSE` file (e.g. MIT) if you intend others to reuse this code.

---

## 👤 Author

**Arkaprava**
GitHub: [@arka562](https://github.com/arka562)

Built as part of a B.Tech final-year project, originating from a Digital E-Logbook system developed during an industrial internship.
