-- Seeding data for AI-Powered Smart Placement Management System
-- Use Bcrypt hash for 'password': $2a$10$U.gR67Y0zC1jX82i795ZPe2y.h5o5HlP8y6RpyPqU7U/mG7aN2bLu
USE pms_db;

-- 1. Seed Skills
INSERT INTO skills (name) VALUES 
('Java'), ('Python'), ('JavaScript'), ('TypeScript'), 
('C++'), ('SQL'), ('React'), ('Spring Boot'), 
('HTML/CSS'), ('Node.js'), ('Docker'), ('Kubernetes'), 
('AWS'), ('Git'), ('Data Structures'), ('Machine Learning');

-- 2. Seed Users
-- Passwords are Bcrypt hashes of 'password'
INSERT INTO users (username, password, email, role, is_active) VALUES
('admin', '$2a$10$U.gR67Y0zC1jX82i795ZPe2y.h5o5HlP8y6RpyPqU7U/mG7aN2bLu', 'admin@university.edu', 'SUPER_ADMIN', true),
('tpo_officer', '$2a$10$U.gR67Y0zC1jX82i795ZPe2y.h5o5HlP8y6RpyPqU7U/mG7aN2bLu', 'tpo@university.edu', 'PLACEMENT_OFFICER', true),
('faculty_coord', '$2a$10$U.gR67Y0zC1jX82i795ZPe2y.h5o5HlP8y6RpyPqU7U/mG7aN2bLu', 'faculty.coordinator@university.edu', 'FACULTY_COORDINATOR', true),
('recruiter_google', '$2a$10$U.gR67Y0zC1jX82i795ZPe2y.h5o5HlP8y6RpyPqU7U/mG7aN2bLu', 'careers@google.com', 'RECRUITER', true),
('recruiter_microsoft', '$2a$10$U.gR67Y0zC1jX82i795ZPe2y.h5o5HlP8y6RpyPqU7U/mG7aN2bLu', 'talent@microsoft.com', 'RECRUITER', true),
('student1', '$2a$10$U.gR67Y0zC1jX82i795ZPe2y.h5o5HlP8y6RpyPqU7U/mG7aN2bLu', 'amit.sharma@student.edu', 'STUDENT', true),
('student2', '$2a$10$U.gR67Y0zC1jX82i795ZPe2y.h5o5HlP8y6RpyPqU7U/mG7aN2bLu', 'sneha.patel@student.edu', 'STUDENT', true),
('student3', '$2a$10$U.gR67Y0zC1jX82i795ZPe2y.h5o5HlP8y6RpyPqU7U/mG7aN2bLu', 'rohan.das@student.edu', 'STUDENT', true);

-- 3. Seed Companies
INSERT INTO companies (name, website, industry, description, location, verification_status, logo_url, rating) VALUES
('Google', 'https://google.com', 'Technology', 'Search engine and cloud computing technology provider.', 'Bangalore, India', 'VERIFIED', 'https://res.cloudinary.com/demo/image/upload/v1582236965/sample.jpg', 4.90),
('Microsoft', 'https://microsoft.com', 'Technology', 'Leading global vendor of computer software and hardware.', 'Hyderabad, India', 'VERIFIED', 'https://res.cloudinary.com/demo/image/upload/v1582236965/sample.jpg', 4.70),
('Meta', 'https://meta.com', 'Social Media', 'Focuses on building products that enable people to connect.', 'Gurgaon, India', 'PENDING', 'https://res.cloudinary.com/demo/image/upload/v1582236965/sample.jpg', 4.50);

-- 4. Seed Recruiters
INSERT INTO recruiters (user_id, company_id, designation, is_verified) VALUES
(4, 1, 'Senior Technical Recruiter', true),
(5, 2, 'Talent Acquisition Lead', true);

-- 5. Seed Students
INSERT INTO students (user_id, roll_number, branch, section, year, cgpa, backlogs, linkedin_url, github_url, portfolio_url, eligibility_status) VALUES
(6, 'CSE-2022-001', 'Computer Science & Engineering', 'Sec-A', 4, 9.20, 0, 'https://linkedin.com/in/amitsharma', 'https://github.com/amitsharma', 'https://amitsharma.dev', true),
(7, 'IT-2022-004', 'Information Technology', 'Sec-B', 4, 8.50, 0, 'https://linkedin.com/in/snehapatel', 'https://github.com/snehapatel', NULL, true),
(8, 'ECE-2022-012', 'Electronics & Communication', 'Sec-C', 4, 6.50, 1, 'https://linkedin.com/in/rohandas', NULL, NULL, false);

-- 6. Associate Student Skills
INSERT INTO student_skills (student_id, skill_id) VALUES
(1, 1), -- Student 1: Java
(1, 8), -- Student 1: Spring Boot
(1, 7), -- Student 1: React
(1, 4), -- Student 1: TypeScript
(2, 2), -- Student 2: Python
(2, 3), -- Student 2: JavaScript
(2, 7), -- Student 2: React
(3, 5), -- Student 3: C++
(3, 9); -- Student 3: HTML/CSS

-- 7. Seed Jobs
INSERT INTO jobs (recruiter_id, title, description, requirements, salary_package, location, work_type, application_deadline, min_cgpa, max_backlogs, status) VALUES
(1, 'Software Engineer - Full Stack', 'We are looking for a Software Engineer to join our core development team. You will build highly-scalable features on our React & Spring Boot stack.', 'Strong knowledge of Java/Spring and modern React. Good command over DS/Algo.', 22.50, 'Bangalore, India', 'ON_SITE', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY), 8.00, 0, 'APPROVED'),
(1, 'Frontend Developer (Intern)', 'Join us to craft clean, performant user interfaces. You will work alongside UX designers to implement polished web components.', 'Familiarity with HTML, CSS, JavaScript, and React framework. Creative mindset.', 8.00, 'Remote', 'REMOTE', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 15 DAY), 7.50, 0, 'APPROVED'),
(2, 'Software Engineer (C++)', 'Build performance-critical systems for cloud infrastructures. You will optimize memory usage, design high-efficiency pipelines, and write robust concurrent code.', 'Excellent debugging and profiling skills. Deep understanding of memory architectures and C++ systems programming.', 30.00, 'Hyderabad, India', 'HYBRID', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 20 DAY), 8.50, 0, 'PENDING_APPROVAL');

-- 8. Job Branches Eligibility
INSERT INTO job_branches (job_id, branch) VALUES
(1, 'Computer Science & Engineering'),
(1, 'Information Technology'),
(2, 'Computer Science & Engineering'),
(2, 'Information Technology'),
(2, 'Electronics & Communication'),
(3, 'Computer Science & Engineering');

-- 9. Job Skills Requirements
INSERT INTO job_skills (job_id, skill_id) VALUES
(1, 1), -- Job 1: Java
(1, 8), -- Job 1: Spring Boot
(1, 7), -- Job 1: React
(2, 7), -- Job 2: React
(2, 9), -- Job 2: HTML/CSS
(3, 5); -- Job 3: C++

-- 10. Seed Applications
INSERT INTO applications (student_id, job_id, resume_url, status) VALUES
(1, 1, 'https://res.cloudinary.com/demo/image/upload/v1582236965/resume_amit.pdf', 'SHORTLISTED'),
(2, 1, 'https://res.cloudinary.com/demo/image/upload/v1582236965/resume_sneha.pdf', 'APPLIED'),
(2, 2, 'https://res.cloudinary.com/demo/image/upload/v1582236965/resume_sneha.pdf', 'UNDER_REVIEW');

-- 11. Seed Interviews
INSERT INTO interviews (application_id, recruiter_id, title, date_time, location_link, duration_minutes, status) VALUES
(1, 1, 'Technical Round 1 (System Design & DSA)', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 2 DAY), 'https://meet.google.com/abc-defg-hij', 60, 'SCHEDULED');

-- 12. Seed Projects
INSERT INTO projects (student_id, title, description, technologies_used) VALUES
(1, 'E-Commerce Platform', 'An end-to-end e-commerce website with payment gateway and search indexes.', 'Spring Boot, MySQL, React, Redis'),
(2, 'Social Networking App', 'A lightweight social network that allows posting text updates, liking, and real-time chat.', 'Node.js, WebSockets, MongoDB, React');

-- 13. Seed Certificates
INSERT INTO certificates (student_id, name, issuing_organization, issue_date) VALUES
(1, 'AWS Certified Cloud Practitioner', 'Amazon Web Services', '2025-01-10'),
(2, 'React Advanced Concepts', 'Udemy', '2025-03-15');

-- 14. Seed Notifications
INSERT INTO notifications (user_id, title, message, type) VALUES
(6, 'Job Application Update', 'Congratulations! Your application for Software Engineer - Full Stack has been shortlisted.', 'APPLICATION'),
(6, 'Interview Scheduled', 'Your interview for the Software Engineer role is scheduled for ' || DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 2 DAY), 'INTERVIEW');
