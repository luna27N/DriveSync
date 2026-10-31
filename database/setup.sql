-- DriveSync database bootstrap (non-destructive).
CREATE DATABASE IF NOT EXISTS drivesync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE drivesync;
-- Spring Boot / Hibernate creates and updates the remaining tables from the
-- existing entities and the added placement_rounds, round_results,
-- notification_logs and students.mobile_number mappings.
-- Do not drop existing tables: this project uses spring.jpa.hibernate.ddl-auto=update.
