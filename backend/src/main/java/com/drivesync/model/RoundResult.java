package com.drivesync.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity @Table(name="round_results", uniqueConstraints=@UniqueConstraint(columnNames={"round_id","application_id"}))
@Getter @Setter @NoArgsConstructor
public class RoundResult {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false) private PlacementRound round;
 @ManyToOne(optional=false) private PlacementApplication application;
 @Column(nullable=false) private String result="PENDING";
 @Column(length=2000) private String remarks;
 private LocalDateTime updatedAt=LocalDateTime.now();
}
