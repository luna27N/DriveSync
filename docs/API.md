# DriveSync API reference

Base URL: `http://localhost:8082/api`. All routes except `/health` require HTTP Basic authentication. Admin account role is `ADMIN`; student role is `STUDENT`.

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | `/health` | Public | Health check |
| GET | `/auth/me` | Any authenticated | Current account |
| GET | `/drives` | Authenticated | Drive catalogue (no private student data) |
| GET | `/drives/eligible` | Student | Drives with eligibility result for current student |
| POST/PUT/DELETE | `/drives[/{id}]` | Admin | Create/update/delete drive |
| GET | `/applications/drive/{driveId}/eligible` | Admin | Eligible roster and eligible count |
| POST | `/applications` | Student | Apply; backend rechecks eligibility and duplicate |
| GET | `/applications/me` | Student | Own application history |
| GET | `/notifications/me` | Student | Own notification activity |
| GET | `/applications/admin-list` | Admin | All applications |
| GET | `/drives/{id}/applicants` | Admin | Applicants for drive |
| PUT | `/applications/{id}/status` | Admin | Set APPLIED/SHORTLISTED/SELECTED/REJECTED |
| POST | `/students/import` | Admin | Import XLSX; columns A-G: RollNo, Name, Branch, CGPA, Arrears, Email, Mobile Number |
| GET | `/students` | Admin | Student records |
| PUT | `/students/{id}/mobile` | Admin | Update mobile number |
| POST | `/drives/{id}/rounds` | Admin | Create round |
| GET | `/drives/{id}/rounds` | Admin | List rounds |
| PUT | `/rounds/{roundId}` | Admin | Update round |
| GET | `/rounds/{roundId}/results` | Admin | View results recorded for a round |
| POST | `/rounds/{roundId}/results` | Admin | Upsert result for `{applicationId,result,remarks}` |
| GET | `/applications/{applicationId}/round-results` | Owner/Admin | Round results |
| GET | `/drives/{id}/export` | Admin | Applicants and answers XLSX |
| GET | `/drives/{id}/notifications` | Admin | Notification log |
| POST | `/drives/{id}/notifications/test` | Admin | Run notification workflow |
| GET | `/analytics` | Admin | Placement analytics |

## Example drive JSON
```json
{
  "company":"ABC Technologies",
  "roleTitle":"Software Developer",
  "description":"Graduate hiring",
  "minCgpa":7.0,
  "maxArrears":0,
  "branches":["IT","CSE","ECE","EEE"],
  "formQuestions":["Why this role?","GitHub URL"],
  "active":true,
  "deadline":"2026-12-01T23:59:00"
}
```
