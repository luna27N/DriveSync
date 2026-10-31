package com.drivesync.config;

import com.drivesync.model.AppUser;
import com.drivesync.model.Drive;
import com.drivesync.model.Role;
import com.drivesync.model.Student;
import com.drivesync.repository.DriveRepository;
import com.drivesync.repository.StudentRepository;
import com.drivesync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.*;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seedData(
            StudentRepository students,
            UserRepository users,
            DriveRepository drives,
            PasswordEncoder encoder,
            @Value("${drivesync.seed-demo-data:true}") boolean seedDemoData,
            @Value("${drivesync.admin.email:admin@drivesync.local}") String adminEmail,
            @Value("${drivesync.admin.password:Admin@123}") String adminPassword) {
        return args -> {
            if (users.count() == 0) {
                if (seedDemoData) {
                    Student s1 = students.save(new Student("IT2026001", "Aarav Kumar", "IT", 8.4, 0, "student@drivesync.local"));
                    Student s2 = students.save(new Student("IT2026002", "Diya Raman", "CSE", 7.6, 1, "student2@drivesync.local"));
                    Student s3 = students.save(new Student("ECE2026003", "Ishaan Das", "ECE", 6.9, 2, "student3@drivesync.local"));
                    users.save(new AppUser("student@drivesync.local", encoder.encode("Student@123"), Role.STUDENT, s1));
                    users.save(new AppUser("student2@drivesync.local", encoder.encode("Student@123"), Role.STUDENT, s2));
                    users.save(new AppUser("student3@drivesync.local", encoder.encode("Student@123"), Role.STUDENT, s3));
                }
                if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank() || (!seedDemoData && adminPassword.length() < 12)) {
                    throw new IllegalStateException("Configure ADMIN_EMAIL and ADMIN_PASSWORD. Production administrator passwords must contain at least 12 characters.");
                }
                users.save(new AppUser(adminEmail.trim().toLowerCase(Locale.ROOT), encoder.encode(adminPassword), Role.ADMIN, null));
            }
            if (seedDemoData && drives.count() == 0) {
                Drive d = new Drive();
                d.setCompany("Nexa Technologies"); d.setRoleTitle("Graduate Software Engineer");
                d.setDescription("Build reliable products with a collaborative engineering team.");
                d.setMinCgpa(7.0); d.setMaxArrears(1); d.setBranches(new LinkedHashSet<>(List.of("IT", "CSE")));
                d.setFormQuestions(new ArrayList<>(List.of("Why are you interested in this role?", "Preferred technical skill", "GitHub profile URL")));
                drives.save(d);
                Drive d2 = new Drive();
                d2.setCompany("BluePeak Systems"); d2.setRoleTitle("Java Developer Trainee");
                d2.setDescription("Java, REST APIs, SQL and problem-solving focused trainee role.");
                d2.setMinCgpa(6.5); d2.setMaxArrears(2); d2.setBranches(new LinkedHashSet<>());
                d2.setFormQuestions(new ArrayList<>(List.of("Briefly describe a Java project", "Notice period / availability")));
                drives.save(d2);
            }
        };
    }
}
