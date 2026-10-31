# Deploy DriveSync: Vercel + Render

This project uses Vercel for the React/Vite frontend, Render for the Spring Boot API, and an external MySQL 8-compatible database. Render's web service is not itself a MySQL server; create the database with a managed MySQL provider that permits external TLS connections (for example, Aiven or another MySQL host).

## 1. Prepare the MySQL database

1. Create a managed MySQL 8 database with your chosen database provider.
2. Create a database/schema named `drivesync` and a dedicated database user with access only to that schema.
3. Copy the provider's hostname, port, database name, username and password.
4. Build the JDBC URL using the provider's required TLS options. A typical form is:

   `jdbc:mysql://HOST:PORT/drivesync?sslMode=REQUIRED&serverTimezone=UTC`

   Use the exact TLS/connection instructions supplied by your database provider. Do not use `localhost` in Render.
5. Keep a backup of the database credentials. Do not put them in GitHub or in frontend environment variables.

The application currently uses Hibernate `ddl-auto=update` to create/update tables at startup. `DDL_AUTO=update` is suitable for this academic deployment. For a long-lived production system, introduce Flyway/Liquibase migrations and set `DDL_AUTO=validate` after migrations are in place.

## 2. Push the project to GitHub

From the extracted `DriveSync` project root:

```bash
git init
git add .
git commit -m "Prepare DriveSync for deployment"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/DriveSync.git
git push -u origin main
```

Check that no `.env` file, database dump containing real student data, password, or provider credential is committed.

## 3. Deploy the backend on Render

1. Sign in to Render and choose **New → Blueprint**.
2. Connect the GitHub repository containing this project. Render reads `render.yaml` from the repository root and creates the `drivesync-api` web service.
3. In the service's **Environment** settings, provide these values:

   | Key | Value |
   |---|---|
   | `DB_URL` | `jdbc:mysql://HOST:PORT/drivesync?sslMode=REQUIRED&serverTimezone=UTC` (use provider's TLS settings) |
   | `DB_USERNAME` | Dedicated MySQL username |
   | `DB_PASSWORD` | MySQL password |
   | `ADMIN_EMAIL` | Your own TPO/admin login email |
   | `ADMIN_PASSWORD` | A unique password of at least 12 characters |
   | `FRONTEND_ORIGIN` | Temporary value `https://example.vercel.app`; update after Vercel deployment |

4. Keep `SEED_DEMO_DATA=false` on Render. This prevents sample student accounts and sample drives from being created. The first startup creates only the administrator account from `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
5. Keep notification test mode enabled initially. Add SMTP/Twilio credentials only when you are ready to test real delivery and have permission to message recipients.
6. Deploy. Wait for the service to become **Live**.
7. Open `https://YOUR-RENDER-SERVICE.onrender.com/api/health`. The endpoint should return a healthy JSON response. If it fails, inspect Render **Logs** and verify database connectivity and credentials.

**Important:** The admin account is seeded only when the `users` table is empty. If you change `ADMIN_EMAIL` or `ADMIN_PASSWORD` after that account already exists, the existing account is not automatically changed. Use the application's account/password management process or update the account securely in the database; do not drop production tables just to reset a password.

## 4. Deploy the frontend on Vercel

1. Sign in to Vercel and choose **Add New → Project**.
2. Import the same GitHub repository.
3. Set **Root Directory** to `frontend`.
4. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`. Install command: `npm install`.
5. Add this environment variable for Production (and Preview only if needed):

   `VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api`

6. Deploy and copy the final Vercel production domain, such as `https://drivesync.vercel.app`.

`frontend/vercel.json` contains the SPA rewrite so direct navigation to frontend routes serves the React application.

## 5. Finish CORS configuration

Return to Render → `drivesync-api` → Environment and set:

`FRONTEND_ORIGIN=https://YOUR-ACTUAL-VERCEL-DOMAIN.vercel.app`

Use the exact origin only: no trailing slash and no `/api` path. Save the change and redeploy/restart the backend. The backend CORS configuration permits this exact origin.

## 6. Smoke-test after deployment

1. Open the Vercel URL and sign in using the admin email/password configured in Render.
2. Confirm the TPO dashboard loads without browser CORS errors.
3. Create a test drive and confirm it appears in the student portal.
4. Create a test student account or import test-only student data; do not use real student records until privacy and access controls have been reviewed.
5. Test eligibility, application submission, duplicate application rejection, custom questions, round/result updates and Excel export.
6. Check Render logs and browser developer tools if an API request fails.

## Important security and operational limitations

- The current application uses HTTP Basic authentication over HTTPS. It is acceptable for a controlled academic demo, but it is not the recommended final authentication design for a public production system. Before broad public use, replace it with a reviewed session/token design, implement password reset and rate limiting, and add appropriate CSRF protections.
- The current application does not implement a self-service password-reset workflow. Do not distribute shared demo passwords to real students.
- Real SMS/email is disabled by default. Provider credentials and sender verification are required; successful code deployment does not prove message delivery.
- The app currently uses `ddl-auto=update`; take database backups before redeployments and use schema migrations for production.
- Render free instances may sleep and have cold starts. A paid always-on instance is more appropriate for a live demo where fast first response matters.
- Do not enable real notifications until the recipient data, consent, message content, sender setup and provider credentials have been checked.
