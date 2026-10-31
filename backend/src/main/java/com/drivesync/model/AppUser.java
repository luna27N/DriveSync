package com.drivesync.model;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="users")
@Getter @Setter @NoArgsConstructor
public class AppUser {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false, unique=true) private String email;
    @Column(nullable=false) private String password;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private Role role;
    @OneToOne @JoinColumn(name="student_id", unique=true) private Student student;
    public AppUser(String email, String password, Role role, Student student) {
        this.email=email; this.password=password; this.role=role; this.student=student;
    }
}
