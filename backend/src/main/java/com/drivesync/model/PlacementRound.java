package com.drivesync.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity @Table(name="placement_rounds")
@Getter @Setter @NoArgsConstructor
public class PlacementRound {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false) private Drive drive;
 @Column(nullable=false) private String name;
 @Column(length=2000) private String description;
 private Integer sequenceNo;
 private LocalDateTime scheduledAt;
 private LocalDateTime createdAt=LocalDateTime.now();
}
