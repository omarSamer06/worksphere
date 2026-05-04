# 🚀 WorkSphere — Full HR Management System

WorkSphere is a full-stack HR Management System built using the MERN stack, designed to handle real-world business operations with a modern, role-based user experience.

---

## 🌐 Live Demo

🔗 https://your-app.vercel.app

---

## 🧠 Overview

WorkSphere streamlines core HR processes including employee management, recruitment, attendance tracking, leave workflows, and payroll.

The system supports **three distinct roles**:

* 👑 Admin — full system control
* 👨‍💼 Manager — team operations & approvals
* 👤 Employee — personal workspace

Each role has a **custom dashboard and experience**, ensuring clarity and efficiency.

---

## ✨ Key Features

### 🔐 Authentication & Authorization

* JWT-based authentication
* Role-based access control (Admin, Manager, Employee)
* Protected routes across frontend and backend

---

### 👥 Employee Management

* Create and manage employees
* Assign departments & positions
* Profile management system

---

### 🏢 Organization Structure

* Departments & positions
* Hierarchical structure
* Manager assignment system

---

### 📊 Recruitment System

* Candidate management
* Status tracking (applied, interviewing, accepted, rejected)
* Hire candidates → convert to employees

---

### 📝 Leave Management

* Request leave
* Approval workflow (Manager/Admin)
* Leave balance tracking
* Leave types (annual, sick)

---

### ⏱️ Attendance System

* Clock in / Clock out
* Lateness detection
* Attendance history
* Manager visibility

---

### 💰 Payroll System

* Salary management
* Automated payroll generation
* Leave-based deductions
* Payslip generation

---

### 🎨 Modern UI/UX

* Role-based UI themes
* Interactive dashboards
* Clean SaaS-style design
* Fully responsive layout

---

## 🛠️ Tech Stack

### Frontend

* React (Hooks)
* Tailwind CSS
* Axios
* React Router
* Context API

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

### Security & Middleware

* JWT Authentication
* bcrypt (password hashing)
* helmet, cors, morgan
* rate limiting
* express-validator

---

## ☁️ Deployment

* Frontend: Vercel
* Backend: Render
* Database: MongoDB Atlas

---

## 🧪 Demo Accounts

Use these accounts to explore the system:

Admin
email: [admin@test.com](mailto:admin@test.com)
password: 123456

Manager
email: [manager@test.com](mailto:manager@test.com)
password: 123456

Employee
email: [employee@test.com](mailto:employee@test.com)
password: 123456

---

## ⚙️ Installation (Local Setup)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/worksphere.git
cd worksphere
```

---

### 2. Backend setup

```bash
cd backend
npm install
```

Create `.env`:

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:5173
```

Run backend:

```bash
npm run dev
```

---

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:5000
```

Run frontend:

```bash
npm run dev
```

---

## 📸 Screenshots

(Add screenshots here)

* Admin Dashboard
* Manager Dashboard
* Employee Dashboard
* Recruitment Page
* Payroll / Payslip

---

## 🎯 Project Highlights

* Full business workflow implementation
* Role-based system design
* Clean architecture & scalable structure
* Production-ready deployment
* Modern UI with strong UX focus

---

## 📌 Future Improvements

* Advanced payroll (tax, insurance)
* Email notifications
* File uploads (documents)
* Analytics dashboard

---

## 👨‍💻 Author

Developed by Omar
Full-Stack MERN Developer

---

## ⭐ Final Note

WorkSphere is designed to reflect real-world HR systems with a focus on usability, scalability, and clean architecture.

If you like this project, feel free to ⭐ the repository!
