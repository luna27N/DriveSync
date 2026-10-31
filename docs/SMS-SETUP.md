# Twilio SMS setup

1. Create/verify a Twilio account and obtain an Account SID, Auth Token and SMS-capable sender number.
2. Store `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` as environment secrets.
3. Set `SMS_NOTIFICATIONS_ENABLED=true` and `NOTIFICATION_TEST_MODE=false`.
4. Import the optional seventh Excel column `Mobile Number` using E.164 format, e.g. `+919876543210`, or update it using `PUT /api/students/{id}/mobile`.
5. Check `GET /api/drives/{id}/notifications` for provider acceptance/failure.

Twilio trial accounts may only message verified destination numbers. A provider-accepted message is not proof of handset delivery. Test mode is enabled by default and sends nothing.
