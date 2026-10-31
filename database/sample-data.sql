-- Optional sample drive. Run AFTER the backend has started once so Hibernate
-- has created the tables and DataSeeder has created demo users/student records.
USE drivesync;
INSERT IGNORE INTO drives
(id, active, company, created_at, deadline, description, max_arrears, min_cgpa, role_title)
VALUES
(9001, TRUE, 'ABC Technologies', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY),
 'Sample software developer placement opportunity.', 0, 7.0, 'Software Developer');
DELETE FROM drive_branches WHERE drive_id=9001;
DELETE FROM drive_questions WHERE drive_id=9001;
INSERT INTO drive_branches (drive_id, branch_name)
VALUES (9001,'IT'),(9001,'CSE'),(9001,'ECE'),(9001,'EEE');
INSERT INTO drive_questions (drive_id, question_order, question_text)
VALUES (9001,0,'Why are you interested in this role?'),
       (9001,1,'Share your GitHub profile URL');
