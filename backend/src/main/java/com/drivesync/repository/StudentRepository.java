package com.drivesync.repository;
import com.drivesync.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface StudentRepository extends JpaRepository<Student,Long> {
 Optional<Student> findByRollNoIgnoreCase(String rollNo);
 Optional<Student> findByEmailIgnoreCase(String email);
 boolean existsByRollNoIgnoreCase(String rollNo);
 boolean existsByEmailIgnoreCase(String email);
}
