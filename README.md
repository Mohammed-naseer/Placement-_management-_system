# 🎓 AI Placement Management System

An AI-powered Placement Management System developed using **Spring Boot**, **Java**, **MySQL**, **HTML**, **CSS**, and **JavaScript**. The system streamlines campus recruitment by connecting students, recruiters, and placement officers through a centralized platform.

---

## 📌 Project Overview

The AI Placement Management System is a web-based application designed to automate and simplify the campus placement process. It enables educational institutions to efficiently manage student profiles, company recruitment drives, job applications, interview scheduling, and placement reports while providing a secure and user-friendly experience.

---

## 🚀 Features

### 👨‍🎓 Student Module
- Student Registration & Login
- Profile Management
- Resume Upload
- View Available Jobs
- Apply for Jobs
- Track Application Status
- Interview Schedule
- Notifications
- AI Chat Support

### 🏢 Recruiter Module
- Recruiter Registration & Login
- Company Profile Management
- Post Job Openings
- View Eligible Students
- Manage Applications
- Schedule Interviews
- Send Notifications

### 👨‍💼 Admin Module
- Dashboard
- Manage Students
- Manage Recruiters
- Manage Companies
- Manage Job Postings
- Manage Interviews
- Placement Reports
- Analytics Dashboard
- User Management

### 🤖 AI Features
- Smart Eligibility Checker
- AI Resume Analysis
- AI Chat Assistant
- Automated Recommendations

---

## 🛠️ Technologies Used

### Backend
- Java 24
- Spring Boot
- Spring Security
- Spring Data JPA
- JWT Authentication
- REST API

### Frontend
- HTML5
- CSS3
- JavaScript (ES6)
- Thymeleaf

### Database
- MySQL

### Build Tool
- Maven

### Development Tools
- IntelliJ IDEA / Eclipse
- VS Code
- MySQL Workbench
- Postman
- Git & GitHub

---

## 📂 Project Structure

```
Placement_Management_System
│
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com.pms
│   │   │       ├── config
│   │   │       ├── controller
│   │   │       ├── dto
│   │   │       ├── entity
│   │   │       ├── repository
│   │   │       ├── security
│   │   │       ├── service
│   │   │       └── util
│   │   │
│   │   └── resources
│   │       ├── static
│   │       │   ├── css
│   │       │   ├── js
│   │       │   ├── images
│   │       │   └── uploads
│   │       │
│   │       ├── templates
│   │       │   ├── student
│   │       │   ├── recruiter
│   │       │   ├── admin
│   │       │   └── fragments
│   │       │
│   │       └── application.properties
│
├── pom.xml
└── README.md
```

---

## 🔐 Authentication

- JWT Authentication
- Role-Based Authorization
- Secure Password Encryption
- Spring Security Integration

---

## 📊 Modules

- Authentication
- Student Management
- Recruiter Management
- Company Management
- Job Management
- Job Applications
- Interview Scheduling
- Notifications
- AI Chatbot
- AI Resume Analysis
- Placement Reports
- Dashboard Analytics

---

## 📈 Future Enhancements

- Face Recognition Attendance
- AI Interview Assessment
- Resume Score Prediction
- Email & SMS Notifications
- Mobile Application
- Video Interview Integration
- Cloud Deployment

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/AI-Placement-Management-System.git
```

### Open Project

Import the project into IntelliJ IDEA or Eclipse.

### Configure Database

Create a MySQL database:

```sql
CREATE DATABASE placement_management_system;
```

Update `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/placement_management_system
spring.datasource.username=root
spring.datasource.password=your_password
```

### Run Application

```bash
mvn spring-boot:run
```

Open:

```
http://localhost:8080
```

---

## 📷 Screenshots

- Home Page
- Login Page
- Student Dashboard
- Recruiter Dashboard
- Admin Dashboard
- Job Management
- Interview Scheduler
- Analytics Dashboard

---

## 🎯 Project Objectives

- Automate campus placement activities.
- Simplify student and recruiter interaction.
- Reduce manual work.
- Improve placement efficiency.
- Provide AI-powered assistance.
- Generate placement analytics and reports.

---

## 👨‍💻 Developed By

**Mohammed Naseeruddin**

B.Tech Computer Science Engineering

---

## 📄 License

This project is developed for educational purposes.
