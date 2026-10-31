package com.drivesync.repository;
import com.drivesync.model.Drive;
import org.springframework.data.jpa.repository.JpaRepository;
public interface DriveRepository extends JpaRepository<Drive,Long> {}