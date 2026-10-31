package com.drivesync.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity @Table(name="notification_logs", uniqueConstraints=@UniqueConstraint(columnNames={"drive_id","student_id","channel"}))
@Getter @Setter @NoArgsConstructor
public class NotificationLog {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="drive_id",nullable=false) private Long driveId;
 @Column(name="student_id",nullable=false) private Long studentId;
 @Column(nullable=false,length=12) private String channel;
 @Column(nullable=false,length=20) private String status;
 @Column(length=1000) private String detail;
 private LocalDateTime createdAt=LocalDateTime.now();
}
