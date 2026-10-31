package com.drivesync.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity @Table(name="drives")
@Getter @Setter @NoArgsConstructor
public class Drive {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @NotBlank @Column(nullable=false) private String company;
    @NotBlank @Column(nullable=false) private String roleTitle;
    @Column(length=2000) private String description;
    @DecimalMin("0.0") @DecimalMax("10.0") private double minCgpa;
    @Min(0) private int maxArrears;
    @ElementCollection(fetch=FetchType.EAGER) @CollectionTable(name="drive_branches", joinColumns=@JoinColumn(name="drive_id"))
    @Column(name="branch_name") private Set<String> branches = new LinkedHashSet<>();
    @ElementCollection(fetch=FetchType.EAGER) @CollectionTable(name="drive_questions", joinColumns=@JoinColumn(name="drive_id"))
    @OrderColumn(name="question_order") @Column(name="question_text") private List<String> formQuestions = new ArrayList<>();
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime deadline;
    private boolean active = true;
}
