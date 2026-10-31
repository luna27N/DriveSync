# Gmail SMTP setup

1. Enable 2-Step Verification on the dedicated Gmail sender account.
2. Create a Google App Password in Google Account > Security > App passwords (if the account is eligible).
3. Set `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USERNAME=sender@gmail.com`, `SMTP_PASSWORD=<16-character-app-password>`, `NOTIFICATION_FROM=sender@gmail.com`.
4. Set `EMAIL_NOTIFICATIONS_ENABLED=true` and `NOTIFICATION_TEST_MODE=false` only after testing with a controlled mailbox.
5. Keep the app password in the hosting provider's secret/environment settings. Never commit it.

The default `NOTIFICATION_TEST_MODE=true` prevents external delivery. In test mode, eligible recipients are recorded as `TEST_MODE` in `notification_logs`. Real delivery has not been verified without your provider credentials.
