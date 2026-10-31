package com.drivesync.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity @Table(name="applications", uniqueConstraints=@UniqueConstraint(columnNames={"student_id","drive_id"}))
@Getter @Setter @NoArgsConstructor
public class PlacementApplication {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) private Student student;
    @ManyToOne(optional=false) private Drive drive;
    @ElementCollection(fetch=FetchType.EAGER) @CollectionTable(name="application_answers", joinColumns=@JoinColumn(name="application_id"))
    @MapKeyColumn(name="question_text") @Column(name="answer_text") private Map<String,String> answers = new LinkedHashMap<>();
    @Enumerated(EnumType.STRING) @Column(nullable=false) private ApplicationStatus status = ApplicationStatus.APPLIED;
    private LocalDateTime appliedAt = LocalDateTime.now();
}
