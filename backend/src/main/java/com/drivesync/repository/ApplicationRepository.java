package com.drivesync.repository;
import com.drivesync.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface ApplicationRepository extends JpaRepository<PlacementApplication,Long> {
 boolean existsByStudentIdAndDriveId(Long studentId, Long driveId);
 List<PlacementApplication> findByStudentIdOrderByAppliedAtDesc(Long studentId);
 List<PlacementApplication> findByDriveIdOrderByAppliedAtDesc(Long driveId);
 long countByDriveId(Long driveId);
 long countByDriveIdAndStatus(Long driveId, ApplicationStatus status);
}