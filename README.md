# Employee Attendance Management System

A full-stack, professional, and beginner/intermediate-friendly **Employee Attendance Management System** designed for technical interview demonstrations.

Built with **React.js**, **Node.js/Express.js**, **PostgreSQL**, **JWT Authentication**, and **bcrypt**.

---

## 🌟 Key Features

### 🔐 1. Authentication & Security
- Secure Email & Password Login with `bcrypt` password hashing.
- Stateless JSON Web Token (JWT) session authorization.
- Express role-based authorization middleware (`ADMIN` vs `EMPLOYEE`).
- Passwords are never returned in API payloads.

### 👑 2. Admin Capabilities
- **Admin Dashboard**: Real-time KPI statistics cards for Total Employees, Present Today, Absent Today, and Checked In Today.
- **Employee Directory**: Responsive table displaying all staff members.
- **Employee CRUD**: Add, edit, delete, and view employee profiles.
- **Search & Filter**: Search employees by Name or Email; filter by Department or Role.
- **Organization Attendance Log**: View and filter company-wide attendance history by employee, date, or status.

### 👤 3. Employee Capabilities
- **Personal Workspace**: Interactive Check-In and Check-Out punch buttons.
- **Duplicate Prevention**: Prevents checking in twice on the same day or checking out before checking in.
- **Attendance History**: View past check-in and check-out timestamps and status.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React.js (Vite), React Router DOM v6, Axios, Lucide Icons, Custom CSS |
| **Backend** | Node.js, Express.js, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), CORS |
| **Database** | PostgreSQL (`pg` pool) with schema constraints + Automatic fallback engine |
| **Security** | Role Guards, Input Sanitization, Environment Variables |

---

## 📁 Project Structure

```text
victnet1/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── attendanceController.js
│   │   │   ├── authController.js
│   │   │   ├── dashboardController.js
│   │   │   └── employeeController.js
│   │   ├── db/
│   │   │   ├── index.js
│   │   │   ├── schema.sql
│   │   │   └── seed.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   ├── attendanceRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   └── employeeRoutes.js
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   └── validator.js
│   │   └── server.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Alert.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── StatCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AddEmployee.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AttendanceHistory.jsx
│   │   │   ├── EditEmployee.jsx
│   │   │   ├── EmployeeDashboard.jsx
│   │   │   ├── EmployeeManagement.jsx
│   │   │   └── Login.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── attendanceService.js
│   │   │   ├── authService.js
│   │   │   ├── dashboardService.js
│   │   │   └── employeeService.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/attendance_db
JWT_SECRET=supersecretjwtkey123_interview_project
NODE_ENV=development
```

---

## 🔑 Demo Login Credentials

> **Note**: These accounts are seeded into the database for demonstration.

| Account Type | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `admin123` | `ADMIN` |
| **Employee 1** | `john@example.com` | `emp123` | `EMPLOYEE` |
| **Employee 2** | `jane@example.com` | `emp123` | `EMPLOYEE` |

---

## 🚀 Quick Start & Installation

### 1. Install Dependencies
In the root directory, run:
```bash
npm run install:all
```
*(Or navigate to `backend` and `frontend` separately and run `npm install`)*

### 2. Database Setup & Seed
If using PostgreSQL:
1. Create a database named `attendance_db`.
2. Run the seed script:
```bash
npm run seed
```
> **Zero-Config Fallback**: If PostgreSQL is not installed or running, the backend will automatically switch to an in-memory database mode with pre-seeded data so you can test the application immediately without database setup.

### 3. Launch Development Servers

Run backend (Port 5000):
```bash
npm --prefix backend run dev
```

Run frontend (Port 5173):
```bash
npm --prefix frontend run dev
```

Open your browser at `http://localhost:5173`.

---

## 📚 REST API Documentation

### 1. Authentication APIs

#### `POST /api/auth/login`
- **Purpose**: Authenticate user and issue JWT token.
- **Authentication**: None (Public)
- **Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

#### `GET /api/auth/me`
- **Purpose**: Fetch profile details of logged-in user.
- **Authentication**: Bearer JWT
- **Response (200 OK)**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

---

### 2. Employee Management APIs (Admin Only)

#### `GET /api/employees`
- **Purpose**: Get all employees with optional search and filters.
- **Query Params**: `search`, `department`, `role`
- **Authentication**: Bearer JWT (`ADMIN`)

#### `GET /api/employees/:id`
- **Purpose**: Get single employee by ID.
- **Authentication**: Bearer JWT (`ADMIN`)

#### `POST /api/employees`
- **Purpose**: Register a new employee.
- **Authentication**: Bearer JWT (`ADMIN`)
- **Request Body**:
```json
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "password": "password123",
  "phone": "9876543219",
  "department": "Engineering",
  "position": "DevOps Engineer",
  "role": "EMPLOYEE"
}
```

#### `PUT /api/employees/:id`
- **Purpose**: Update employee profile details.
- **Authentication**: Bearer JWT (`ADMIN`)

#### `DELETE /api/employees/:id`
- **Purpose**: Delete an employee account and attendance history.
- **Authentication**: Bearer JWT (`ADMIN`)

---

### 3. Attendance APIs

#### `POST /api/attendance/check-in`
- **Purpose**: Record check-in for today.
- **Authentication**: Bearer JWT (`EMPLOYEE` / `ADMIN`)
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Check-in recorded successfully.",
  "attendance": {
    "id": 5,
    "user_id": 2,
    "attendance_date": "2026-08-25",
    "check_in": "2026-08-25T09:10:00.000Z",
    "check_out": null,
    "status": "PRESENT"
  }
}
```

#### `POST /api/attendance/check-out`
- **Purpose**: Record check-out time for today's shift.
- **Authentication**: Bearer JWT (`EMPLOYEE` / `ADMIN`)

#### `GET /api/attendance/my`
- **Purpose**: Get logged-in user's attendance log history.
- **Authentication**: Bearer JWT

#### `GET /api/attendance`
- **Purpose**: Admin endpoint to view attendance across all employees.
- **Query Params**: `employee_id`, `date`, `status`
- **Authentication**: Bearer JWT (`ADMIN`)

---

### 4. Dashboard Stats API

#### `GET /api/dashboard/stats`
- **Purpose**: Get aggregated KPI attendance statistics.
- **Authentication**: Bearer JWT (`ADMIN`)
- **Response (200 OK)**:
```json
{
  "success": true,
  "stats": {
    "totalEmployees": 2,
    "presentToday": 1,
    "absentToday": 1,
    "checkedIn": 1
  }
}
```
