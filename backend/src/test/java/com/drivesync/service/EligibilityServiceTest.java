package com.drivesync.service;

import com.drivesync.model.Drive;
import com.drivesync.model.Student;
import org.junit.jupiter.api.Test;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;

class EligibilityServiceTest {
    private final EligibilityService service = new EligibilityService();
    @Test void allowsMatchingStudent() {
        Student s = new Student("IT01","Test Student","IT",8.0,0,"test@example.com");
        Drive d = new Drive(); d.setMinCgpa(7.5); d.setMaxArrears(0); d.setBranches(Set.of("IT"));
        assertEquals(true, service.check(s,d).get("eligible"));
    }
    @Test void branchComparisonIsCaseInsensitive() {
        Student s = new Student("IT02","Test Student","it",8.0,0,"test2@example.com");
        Drive d = new Drive(); d.setMinCgpa(7.0); d.setMaxArrears(0); d.setBranches(Set.of("IT"));
        assertTrue((Boolean)service.check(s,d).get("eligible"));
    }
    @Test void invalidCgpaIsRejectedSafely() {
        Student s = new Student("IT03","Test Student","IT",Double.NaN,0,"test3@example.com");
        Drive d = new Drive(); d.setMinCgpa(7.0); d.setMaxArrears(0); d.setBranches(Set.of("IT"));
        assertFalse((Boolean)service.check(s,d).get("eligible"));
    }
    @Test void explainsEligibilityFailures() {
        Student s = new Student("ECE01","Test Student","ECE",6.5,2,"test@example.com");
        Drive d = new Drive(); d.setMinCgpa(7.5); d.setMaxArrears(0); d.setBranches(Set.of("IT"));
        assertEquals(false, service.check(s,d).get("eligible"));
        assertEquals(3, ((java.util.List<?>)service.check(s,d).get("reasons")).size());
    }
}
