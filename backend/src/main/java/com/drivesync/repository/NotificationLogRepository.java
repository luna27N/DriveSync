package com.drivesync.repository;
import com.drivesync.model.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface NotificationLogRepository extends JpaRepository<NotificationLog,Long> {
 boolean existsByDriveIdAndStudentIdAndChannel(Long driveId,Long studentId,String channel);
 java.util.Optional<NotificationLog> findByDriveIdAndStudentIdAndChannel(Long driveId,Long studentId,String channel);
 List<NotificationLog> findByDriveIdOrderByCreatedAtDesc(Long driveId);
 List<NotificationLog> findByStudentIdOrderByCreatedAtDesc(Long studentId);
}
