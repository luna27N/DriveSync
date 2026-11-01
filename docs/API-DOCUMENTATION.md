# DriveSync – API Documentation

## 1. Overview

DriveSync provides REST APIs for managing placement drives, student applications, eligibility checks, placement rounds and results.

**Base URL (Live):**

`https://drivesync-backend-m6t3.onrender.com/api`

**Backend:** Java 21, Spring Boot 3.5.5  
**Security:** Spring Security HTTP Basic  
**Database:** MySQL-compatible TiDB Cloud  
**Data format:** JSON  
**Authentication:** HTTP Basic (except public endpoints)

## 2. Authentication APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check backend health |
| POST | `/auth/register` | Register a new student |
| GET | `/auth/me` | Get logged-in user details |

### Student registration

**POST** `/auth/register`

Request body:

```json
{
  "name": "Test Student",
  "rollNo": "DS2026001",
  "email": "student@example.com",
  "password": "YourPassword123",
  "branch": "IT",
  "cgpa": 8.5,
  "arrears": 0,
  "mobileNumber": "9876543210"
}
```

Expected success status: `201 Created`

## 3. Student APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/students` | Retrieve student records |
| PUT | `/students/{id}/mobile` | Update student mobile number |
| POST | `/students/import` | Import students using Excel |
| GET | `/drives/eligible` | View drives with personal eligibility information |
| GET | `/applications/me` | View logged-in student's applications |
| GET | `/notifications/me` | View student's notifications |
| GET | `/applications/{applicationId}/round-results` | View application round results |

### Update mobile number

**PUT** `/students/{id}/mobile`

```json
{
  "mobileNumber": "+919876543210"
}
```

## 4. Placement Drive APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/drives` | Create a placement drive |
| GET | `/drives` | Retrieve all placement drives |
| GET | `/drives/{id}` | Retrieve a specific drive |
| PUT | `/drives/{id}` | Update a placement drive |
| DELETE | `/drives/{id}` | Delete a placement drive |

## 5. Eligibility APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/applications/drive/{driveId}/eligible` | Get students eligible for a drive |

Eligibility is evaluated using CGPA, branch and arrears requirements.

## 6. Application APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/applications` | Submit a placement application |
| GET | `/applications/me` | View personal application history |
| GET | `/applications/admin-list` | Retrieve all applications |
| GET | `/drives/{id}/applicants` | View applicants for a drive |
| PUT | `/applications/{id}/status` | Update application status |

### Submit an application

**POST** `/applications`

```json
{
  "driveId": 1,
  "answers": {
    "Why do you want to join?": "I am interested in software development."
  }
}
```

Supported application statuses:

- APPLIED
- SHORTLISTED
- SELECTED
- REJECTED

The backend checks eligibility, application deadlines, required form answers and duplicate applications.

## 7. Placement Round APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/drives/{driveId}/rounds` | Create a placement round |
| GET | `/drives/{driveId}/rounds` | List placement rounds |
| PUT | `/rounds/{roundId}` | Update a placement round |
| POST | `/rounds/{roundId}/results` | Add or update a round result |
| GET | `/rounds/{roundId}/results` | Retrieve round results |
| GET | `/applications/{applicationId}/round-results` | Retrieve results for an application |

Supported round results:

- PENDING
- SHORTLISTED
- SELECTED
- REJECTED

## 8. Notification APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/drives/{driveId}/notifications` | View drive notification logs |
| POST | `/drives/{driveId}/notifications/test` | Trigger a notification run |

Email and SMS integrations depend on the configured provider credentials and application settings.

## 9. Analytics API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/analytics` | Retrieve placement analytics |

Analytics include total applications, selected students, selection rate, company-wise statistics and branch-wise statistics.

## 10. Excel Export API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/drives/{id}/export` | Export drive applicants as an Excel file |

The exported workbook includes student details, application status, application time and submitted answers.

## 11. Common HTTP Status Codes

| Status | Meaning |
|---|---|
| 200 | Request successful |
| 201 | Resource created successfully |
| 400 | Invalid request |
| 401 | Authentication required or invalid credentials |
| 403 | Access denied or student not eligible |
| 404 | Resource not found |
| 409 | Duplicate application |
| 500 | Internal server error |

## 12. Security Notes

- Protected endpoints require authentication.
- Role-based access is configured through Spring Security.
- Passwords are encoded before storage.
- Students can view their own application history.
- Eligibility is checked by the backend before accepting applications.
- Do not publish real student information or production credentials.

---

**Project:** DriveSync – Placement Drive Coordination System  
**Frontend:** React + Vite  
**Backend:** Spring Boot REST API  
**Deployment:** Vercel + Render + TiDB Cloud
