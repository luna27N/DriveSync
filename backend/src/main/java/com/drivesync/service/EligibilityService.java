package com.drivesync.service;

import com.drivesync.model.*;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class EligibilityService {
    public Map<String,Object> check(Student s, Drive d) {
        List<String> reasons = new ArrayList<>();
        if (s == null || d == null) reasons.add("Student or drive record is missing");
        else {
            double cgpa = s.getCgpa();
            if (!Double.isFinite(cgpa) || cgpa < 0 || cgpa > 10) reasons.add("Student CGPA is missing or invalid");
            else if (cgpa < d.getMinCgpa()) reasons.add("CGPA " + cgpa + " is below " + d.getMinCgpa());
            if (s.getArrears() < 0) reasons.add("Student arrears value is invalid");
            else if (s.getArrears() > d.getMaxArrears()) reasons.add("Arrears " + s.getArrears() + " exceed the allowed " + d.getMaxArrears());
            String branch = s.getBranch();
            Set<String> allowed = d.getBranches();
            if (branch == null || branch.isBlank()) reasons.add("Student branch is missing");
            else if (allowed != null && !allowed.isEmpty() && allowed.stream().noneMatch(b -> b != null && b.trim().equalsIgnoreCase(branch.trim())))
                reasons.add("Branch " + branch + " is not allowed");
        }
        Map<String,Object> result = new LinkedHashMap<>();
        result.put("eligible", reasons.isEmpty()); result.put("reasons", reasons);
        return result;
    }
}
