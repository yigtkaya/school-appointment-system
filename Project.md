# 🏫 School Appointment Management System

A modular web platform for managing **weekly parent–teacher appointments**, built with **React (TanStack)** and **FastAPI**.  
Designed for schools but extendable to clinics, consulting services, or any scheduling-based business.

---

## 📘 Overview

This system enables **parents** to easily schedule meetings with **teachers** based on available weekly time slots.

### Core Features
- Weekly appointment scheduling
- Teacher time slot management (admin)
- Parent login and booking flow
- Online / face-to-face meeting selection
- Automatic slot locking after booking
- Email or WhatsApp appointment notifications
- Weekly schedule auto-reset
- Modular architecture for reusability

---

## 🧠 System Roles

| Role | Capabilities |
|------|---------------|
| **Admin (Principal)** | Manage teachers and define weekly availability |
| **Teacher** | View upcoming appointments |
| **Parent** | Log in, choose teacher, select slot, choose mode (online/face-to-face), confirm appointment |

---

## ⚙️ Tech Stack

### Frontend
- **React + TypeScript**
- **TanStack Router & TanStack Query**
- **Tailwind CSS + shadcn/ui**
- **React Hook Form + Zod**
- **Zustand** for lightweight state management
- **JWT Authentication** (localStorage/sessionStorage)

### Backend
- **FastAPI (Python)**
- **SQLAlchemy ORM + PostgreSQL**
- **Pydantic** for data validation
- **Celery** for background jobs (e.g., reminders)
- **Resend / Twilio WhatsApp API** for notifications
- **Docker** for deployment
- **Render / Fly.io / AWS Lightsail** as hosting options

---

## 🧱 Database Structure (Overview)

### Tables
- **users** – shared table for all user types  
- **teachers** – teacher profiles (branch, info)  
- **parents** – parent/student mapping  
- **available_slots** – teacher-defined time slots  
- **appointments** – parent bookings with mode and status  

### Relationships
- A `teacher` belongs to one `user`
- A `parent` belongs to one `user`
- An `appointment` links a `parent`, `teacher`, and `available_slot`

---

## 🔄 Booking Flow

1. **Admin** defines teacher availability (weekly time slots).  
2. **Parent** logs in → selects teacher → views available slots.  
3. Parent clicks a slot → chooses **Online** or **Face-to-Face**.  
4. System creates appointment + locks slot (`is_booked = true`).  
5. Confirmation message sent via **Email / WhatsApp**.  
6. Weekly background job refreshes next week’s schedule.

---

## 💬 Notifications

**Email:** via Resend / SendGrid / Nodemailer  
**WhatsApp:** via Twilio API / Meta Cloud API  

Triggered automatically on:
- Appointment confirmation
- Appointment cancellation
- Optional reminders (24h before)

---

## 🔐 Authentication Strategy

The system uses **JWT-based authentication**:
- **Token Generation**: JWT tokens issued on login (access + optional refresh tokens)
- **Token Validation**: All protected endpoints validate tokens via middleware
- **Role-Based Access Control (RBAC)**: Dependency injection with role verification
- **Token Storage (Frontend)**: localStorage for web, secure storage for mobile
- **Token Refresh**: Optional refresh token rotation for enhanced security

---

## 🧩 API Endpoints (Draft)

| Method | Endpoint | Role | Description |
|--------|-----------|------|-------------|
| `POST /auth/register` | All | Register new user |
| `POST /auth/login` | All | Login |
| `GET /teachers` | All | List teachers |
| `GET /teachers/:id/slots` | All | Get available slots |
| `POST /appointments` | Parent | Book appointment |
| `GET /appointments/me` | Parent | View appointments |
| `POST /admin/slots` | Admin | Add weekly slot schedule |
| `DELETE /appointments/:id` | Parent | Cancel appointment |

---

## 🧭 Folder Structure

### Backend (FastAPI)
```
app/
├── api/
│   ├── routes/
│   │   ├── auth.py
│   │   ├── teachers.py
│   │   ├── parents.py
│   │   ├── slots.py
│   │   ├── appointments.py
│   │   └── users.py
│   └── v1/
│       └── __init__.py
├── core/
│   ├── config.py
│   ├── security.py
│   └── constants.py
├── models/
│   ├── user.py
│   ├── teacher.py
│   ├── parent.py
│   ├── slot.py
│   └── appointment.py
├── schemas/
│   ├── user.py
│   ├── appointment.py
│   └── ...
├── crud/
│   ├── user.py
│   ├── teacher.py
│   ├── appointment.py
│   └── ...
├── tasks/
│   ├── notifications.py
│   └── scheduled_jobs.py
├── db/
│   ├── base.py
│   ├── session.py
│   └── init_db.py
├── main.py
└── requirements.txt
```

### Frontend (React + TanStack)
```
src/
├── api/               # React Query hooks
├── components/
├── features/
│   ├── auth/
│   ├── teachers/
│   ├── appointments/
│   ├── admin/
├── routes/
│   ├── index.tsx
│   ├── teachers.tsx
│   ├── teacher.$id.tsx
│   ├── appointment.new.tsx
│   └── admin.tsx
└── utils/
```

---

## 📆 Development Roadmap

| Week | Tasks |
|------|--------|
| **1** | Initialize FastAPI + SQLAlchemy + PostgreSQL + JWT Auth |
| **2** | Implement teachers, parents, slots modules |
| **3** | Appointment flow & slot locking logic |
| **4** | Notifications (email + WhatsApp) |
| **5** | React frontend (auth + booking + admin views) |
| **6** | Deployment, testing, optimizations |

---

## 🧩 Future Enhancements
- Teacher availability import/export
- Appointment reminders via SMS
- Video call integration (for online meetings)
- Excel export of appointments
- Multi-language support (TR/EN)

---

## 📜 License
This project is private and owned by **[Your Name / Organization]**.  
All rights reserved unless explicitly licensed.
