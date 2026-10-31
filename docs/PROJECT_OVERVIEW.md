# DriveSync Project Overview

## Problem
Campus placement teams often coordinate drives through disconnected spreadsheets, messaging groups, and forms. This makes eligibility checking repetitive and placement status difficult to track.

## Solution
DriveSync centralizes verified student profiles, company drives, rule-based eligibility, applications, round status updates, exports, and analytics.

## Strong implementation points
1. **Server-side eligibility engine** — checks CGPA, arrears and branch before displaying eligibility and again when applying.
2. **Verified Excel import** — validates rows and reports invalid or duplicate roll numbers.
3. **Role-based authorization** — ADMIN and STUDENT have distinct permissions; a student cannot update application outcomes or read the admin student directory.
4. **Duplicate application protection** — unique database constraint and a service-level pre-check prevent repeat submissions.
5. **Company-specific forms** — each drive can define its own questions and stores the answers with the application.
6. **Selection pipeline and analytics** — track stages from Applied through Selected/Rejected and summarize outcomes by company and branch.
7. **Excel export** — TPO can download a drive's applicants and form answers.

## Demo sequence
1. Sign in as TPO, view students and analytics.
2. Create a drive with a CGPA threshold, maximum arrears, allowed branches, and custom questions.
3. Sign out and sign in as a student.
4. Show eligibility reasons for matching and non-matching drives.
5. Apply to an eligible drive and show duplicate prevention.
6. Sign back in as TPO, change the application stage, and export the applicant list.
7. Sign in as the student again and show the updated status.

## Known local-development decisions
- HTTP Basic authentication is used for simplicity in a local academic demo.
- Demo accounts are seeded automatically on an empty database.
- MySQL schema is created/updated by Hibernate for development.
- The first version does not include email verification, password reset, production deployment, or token-based authentication.
