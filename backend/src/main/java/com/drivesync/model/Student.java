package com.drivesync.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity @Table(name="students", uniqueConstraints=@UniqueConstraint(columnNames="rollNo"))
@Getter @Setter @NoArgsConstructor
public class Student {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @NotBlank @Column(nullable=false, unique=true) private String rollNo;
    @NotBlank @Column(nullable=false) private String name;
    @NotBlank @Column(nullable=false) private String branch;
    @DecimalMin("0.0") @DecimalMax("10.0") private double cgpa;
    @Min(0) private int arrears;
    @Column(unique=true) private String email;
    @Column(length=20) private String mobileNumber;
    public Student(String rollNo, String name, String branch, double cgpa, int arrears, String email) {
        this.rollNo=rollNo; this.name=name; this.branch=branch; this.cgpa=cgpa; this.arrears=arrears; this.email=email;
    }
}
