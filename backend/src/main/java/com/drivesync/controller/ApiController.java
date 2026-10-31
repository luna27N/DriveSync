package com.drivesync.controller;

import com.drivesync.model.*;
import com.drivesync.repository.*;
import com.drivesync.service.EligibilityService;
import com.drivesync.service.NotificationService;
import jakarta.validation.Valid;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ApiController {
    private final StudentRepository students;
    private final UserRepository users;
    private final DriveRepository drives;
    private final ApplicationRepository applications;
    private final EligibilityService eligibility;
    private final PasswordEncoder encoder;
    private final NotificationService notifications;
    private final PlacementRoundRepository rounds;
    private final RoundResultRepository roundResults;
    private final NotificationLogRepository notificationLogs;

    public ApiController(StudentRepository students, UserRepository users, DriveRepository drives,
                         ApplicationRepository applications, EligibilityService eligibility, PasswordEncoder encoder,
                         NotificationService notifications, PlacementRoundRepository rounds,
                         RoundResultRepository roundResults, NotificationLogRepository notificationLogs) {
        this.students=students; this.users=users; this.drives=drives; this.applications=applications;
        this.eligibility=eligibility; this.encoder=encoder; this.notifications=notifications;
        this.rounds=rounds; this.roundResults=roundResults; this.notificationLogs=notificationLogs;
    }

    @GetMapping("/health") public Map<String,Object> health() {
        return Map.of("status","UP","service","DriveSync API","time", LocalDateTime.now().toString());
    }

    @GetMapping("/auth/me") public Map<String,Object> me(Authentication auth) {
        AppUser u = user(auth);
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("id",u.getId()); m.put("email",u.getEmail()); m.put("role",u.getRole().name());
        if (u.getStudent()!=null) {
            Student st=u.getStudent(); m.put("studentId",st.getId()); m.put("name",st.getName()); m.put("rollNo",st.getRollNo());
            m.put("branch",st.getBranch()); m.put("cgpa",st.getCgpa()); m.put("arrears",st.getArrears());
            m.put("mobileNumber",st.getMobileNumber());
        }
        return m;
    }

    @GetMapping("/students") public List<Student> allStudents() { return students.findAll(); }

    @PutMapping("/students/{id}/mobile")
    public Map<String,Object> updateMobile(@PathVariable Long id,@RequestBody MobileRequest req) {
        Student s=students.findById(id).orElseThrow(()->new NoSuchElementException("Student not found"));
        String mobile=req.mobileNumber()==null?"":req.mobileNumber().trim();
        if(!mobile.isBlank() && !mobile.matches("^\\+?[1-9]\\d{7,14}$")) throw new IllegalArgumentException("Enter a valid mobile number in international format.");
        s.setMobileNumber(mobile.isBlank()?null:mobile); students.save(s);
        return Map.of("id",s.getId(),"mobileNumber",s.getMobileNumber()==null?"":s.getMobileNumber());
    }

    @PostMapping(value="/students/import", consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String,Object> importStudents(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) throw new IllegalArgumentException("Choose an .xlsx file.");
        int inserted=0; List<String> errors=new ArrayList<>(); Set<String> seen=new HashSet<>();
        try (Workbook wb = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet=wb.getSheetAt(0);
            for (int i=1;i<=sheet.getLastRowNum();i++) {
                Row row=sheet.getRow(i); if(row==null) continue;
                try {
                    String roll=cell(row,0).trim().toUpperCase(Locale.ROOT);
                    String name=cell(row,1).trim();
                    String branch=cell(row,2).trim().toUpperCase(Locale.ROOT);
                    double cgpa=Double.parseDouble(cell(row,3).trim());
                    double arrearsValue=Double.parseDouble(cell(row,4).trim());
                    if(!Double.isFinite(arrearsValue) || arrearsValue<0 || arrearsValue!=Math.rint(arrearsValue))
                        throw new IllegalArgumentException("Arrears must be a non-negative whole number");
                    int arrears=(int)arrearsValue;
                    String email=cell(row,5).trim().toLowerCase(Locale.ROOT);
                    String mobile=cell(row,6).trim();
                    if(roll.isBlank()||name.isBlank()||branch.isBlank()) throw new IllegalArgumentException("RollNo, Name and Branch are required");
                    if(!Double.isFinite(cgpa)||cgpa<0||cgpa>10) throw new IllegalArgumentException("CGPA must be a number between 0 and 10");
                    if(arrears<0) throw new IllegalArgumentException("Arrears cannot be negative");
                    if(!seen.add(roll)||students.existsByRollNoIgnoreCase(roll)) throw new IllegalArgumentException("Duplicate roll number: "+roll);
                    if(email.isBlank()) email=roll.toLowerCase(Locale.ROOT)+"@student.local";
                    if(!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) throw new IllegalArgumentException("Invalid email address");
                    if(students.existsByEmailIgnoreCase(email)) throw new IllegalArgumentException("Email already exists: "+email);
                    Student s=new Student(roll,name,branch,cgpa,arrears,email);
                    if(!mobile.isBlank() && !mobile.matches("^\\+?[1-9]\\d{7,14}$")) throw new IllegalArgumentException("Invalid mobile number");
                    s.setMobileNumber(mobile.isBlank()?null:mobile);
                    s=students.save(s);
                    users.save(new AppUser(email,encoder.encode("ChangeMe@123"),Role.STUDENT,s));
                    inserted++;
                } catch(Exception ex) { errors.add("Row "+(i+1)+": "+ex.getMessage()); }
            }
        }
        return Map.of("inserted",inserted,"errors",errors,"message","Import completed. Imported students receive temporary password ChangeMe@123.");
    }

    @PostMapping("/drives") public Drive createDrive(@Valid @RequestBody Drive drive) {
        drive.setId(null); drive.setCreatedAt(LocalDateTime.now());
        if(drive.getBranches()==null) drive.setBranches(new LinkedHashSet<>());
        if(drive.getFormQuestions()==null) drive.setFormQuestions(new ArrayList<>());
        Drive saved=drives.save(drive); notifications.notifyEligible(saved); return saved;
    }
    @GetMapping("/drives") public List<Map<String,Object>> allDrives() {
        return drives.findAll().stream().map(d -> driveSummary(d, null)).toList();
    }
    @GetMapping("/drives/{id}") public Drive getDrive(@PathVariable Long id) { return findDrive(id); }
    @PutMapping("/drives/{id}") public Drive updateDrive(@PathVariable Long id,@Valid @RequestBody Drive input) {
        Drive d=findDrive(id); d.setCompany(input.getCompany()); d.setRoleTitle(input.getRoleTitle());
        d.setDescription(input.getDescription()); d.setMinCgpa(input.getMinCgpa()); d.setMaxArrears(input.getMaxArrears());
        d.setBranches(input.getBranches()==null?new LinkedHashSet<>():input.getBranches());
        d.setFormQuestions(input.getFormQuestions()==null?new ArrayList<>():input.getFormQuestions());
        d.setDeadline(input.getDeadline()); d.setActive(input.isActive()); Drive saved=drives.save(d); if(saved.isActive()) notifications.notifyEligible(saved); return saved;
    }
    @DeleteMapping("/drives/{id}") public ResponseEntity<?> deleteDrive(@PathVariable Long id) {
        Drive d=findDrive(id); drives.delete(d); return ResponseEntity.noContent().build();
    }

    @GetMapping("/drives/eligible") public List<Map<String,Object>> eligibleDrives(Authentication auth) {
        Student s=requireStudent(user(auth));
        return drives.findAll().stream().map(d -> driveSummary(d,s)).toList();
    }

    @GetMapping("/applications/drive/{driveId}/eligible")
    public Map<String,Object> eligibleStudents(@PathVariable Long driveId) {
        Drive d=findDrive(driveId);
        List<Map<String,Object>> result=students.findAll().stream().filter(st->Boolean.TRUE.equals(eligibility.check(st,d).get("eligible")))
          .map(st->{ Map<String,Object> m=new LinkedHashMap<>(); m.put("studentId",st.getId()); m.put("rollNo",st.getRollNo()); m.put("name",st.getName()); m.put("branch",st.getBranch()); m.put("cgpa",st.getCgpa()); m.put("arrears",st.getArrears()); m.put("email",st.getEmail()); return m; }).toList();
        return Map.of("driveId",driveId,"company",d.getCompany(),"eligibleCount",result.size(),"eligibleStudents",result);
    }

    @PostMapping("/applications") public ResponseEntity<?> apply(@RequestBody ApplyRequest req, Authentication auth) {
        AppUser u=user(auth); Student s=requireStudent(u); Drive d=findDrive(req.driveId());
        if(!d.isActive()) return ResponseEntity.badRequest().body(Map.of("message","This drive is closed."));
        if(d.getDeadline()!=null && d.getDeadline().isBefore(LocalDateTime.now())) return ResponseEntity.badRequest().body(Map.of("message","Application deadline has passed."));
        Map<String,Object> check=eligibility.check(s,d);
        if(!Boolean.TRUE.equals(check.get("eligible"))) return ResponseEntity.status(403).body(Map.of("message","You are not eligible for this drive.","reasons",check.get("reasons")));
        if(applications.existsByStudentIdAndDriveId(s.getId(),d.getId())) return ResponseEntity.status(409).body(Map.of("message","You have already applied to this drive."));
        PlacementApplication a=new PlacementApplication(); a.setStudent(s); a.setDrive(d);
        Map<String,String> answers=req.answers()==null?new LinkedHashMap<>():req.answers();
        Set<String> required=new HashSet<>(d.getFormQuestions());
        for(String question:required) {
            if(answers.get(question)==null || answers.get(question).isBlank())
                return ResponseEntity.badRequest().body(Map.of("message","Please answer every company form question."));
        }
        if(!required.containsAll(answers.keySet()))
            return ResponseEntity.badRequest().body(Map.of("message","Application contains an unknown form question."));
        a.setAnswers(answers); a.setStatus(ApplicationStatus.APPLIED);
        return ResponseEntity.status(201).body(applications.save(a));
    }

    @GetMapping("/applications/me") public List<PlacementApplication> myApplications(Authentication auth) {
        return applications.findByStudentIdOrderByAppliedAtDesc(requireStudent(user(auth)).getId());
    }
    @GetMapping("/notifications/me")
    public List<NotificationLog> myNotifications(Authentication auth) {
        return notificationLogs.findByStudentIdOrderByCreatedAtDesc(requireStudent(user(auth)).getId());
    }
    @GetMapping("/applications/admin-list") public List<PlacementApplication> allApplicationsForAdmin() {
        return applications.findAll();
    }

    @GetMapping("/drives/{id}/applicants") public List<PlacementApplication> applicants(@PathVariable Long id) {
        findDrive(id); return applications.findByDriveIdOrderByAppliedAtDesc(id);
    }
    @PutMapping("/applications/{id}/status") public PlacementApplication updateStatus(@PathVariable Long id,@RequestBody StatusRequest req) {
        PlacementApplication a=applications.findById(id).orElseThrow(()->new NoSuchElementException("Application not found"));
        ApplicationStatus status;
        try { status=ApplicationStatus.valueOf(req.status().toUpperCase(Locale.ROOT)); }
        catch(Exception ex) { throw new IllegalArgumentException("Status must be APPLIED, SHORTLISTED, SELECTED or REJECTED."); }
        if(!Set.of(ApplicationStatus.APPLIED,ApplicationStatus.SHORTLISTED,ApplicationStatus.SELECTED,ApplicationStatus.REJECTED).contains(status))
            throw new IllegalArgumentException("Status must be APPLIED, SHORTLISTED, SELECTED or REJECTED.");
        a.setStatus(status); return applications.save(a);
    }

    @PostMapping("/drives/{driveId}/rounds")
    public PlacementRound createRound(@PathVariable Long driveId,@RequestBody RoundRequest req) {
        if(req.name()==null || req.name().isBlank()) throw new IllegalArgumentException("Round name is required.");
        PlacementRound r=new PlacementRound(); r.setDrive(findDrive(driveId)); r.setName(req.name().trim());
        r.setDescription(req.description()); r.setSequenceNo(req.sequenceNo()==null?1:req.sequenceNo()); r.setScheduledAt(req.scheduledAt());
        return rounds.save(r);
    }
    @GetMapping("/drives/{driveId}/rounds")
    public List<PlacementRound> listRounds(@PathVariable Long driveId) { findDrive(driveId); return rounds.findByDriveIdOrderBySequenceNoAsc(driveId); }
    @PutMapping("/rounds/{roundId}")
    public PlacementRound updateRound(@PathVariable Long roundId,@RequestBody RoundRequest req) {
        PlacementRound r=rounds.findById(roundId).orElseThrow(()->new NoSuchElementException("Round not found"));
        if(req.name()!=null && !req.name().isBlank()) r.setName(req.name().trim());
        r.setDescription(req.description()); r.setSequenceNo(req.sequenceNo()==null?r.getSequenceNo():req.sequenceNo()); r.setScheduledAt(req.scheduledAt());
        return rounds.save(r);
    }
    @PostMapping("/rounds/{roundId}/results")
    public RoundResult updateRoundResult(@PathVariable Long roundId,@RequestBody RoundResultRequest req) {
        PlacementRound round=rounds.findById(roundId).orElseThrow(()->new NoSuchElementException("Round not found"));
        PlacementApplication app=applications.findById(req.applicationId()).orElseThrow(()->new NoSuchElementException("Application not found"));
        if(!Objects.equals(round.getDrive().getId(),app.getDrive().getId())) throw new IllegalArgumentException("Application does not belong to this round's drive.");
        String result=req.result()==null?"PENDING":req.result().toUpperCase(Locale.ROOT);
        if(!Set.of("PENDING","SHORTLISTED","SELECTED","REJECTED").contains(result)) throw new IllegalArgumentException("Invalid round result.");
        RoundResult rr=roundResults.findByRoundIdAndApplicationId(roundId,app.getId()).orElseGet(RoundResult::new);
        rr.setRound(round); rr.setApplication(app); rr.setResult(result); rr.setRemarks(req.remarks()); rr.setUpdatedAt(LocalDateTime.now());
        if(result.equals("REJECTED")) app.setStatus(ApplicationStatus.REJECTED);
        else if(result.equals("SELECTED")) app.setStatus(ApplicationStatus.SELECTED);
        else if(result.equals("SHORTLISTED") && app.getStatus()==ApplicationStatus.APPLIED) app.setStatus(ApplicationStatus.SHORTLISTED);
        applications.save(app); return roundResults.save(rr);
    }
    @GetMapping("/rounds/{roundId}/results")
    public List<RoundResult> roundResultsForAdmin(@PathVariable Long roundId) {
        rounds.findById(roundId).orElseThrow(()->new NoSuchElementException("Round not found"));
        return roundResults.findByRoundId(roundId);
    }
    @GetMapping("/applications/{applicationId}/round-results")
    public List<RoundResult> applicationRoundResults(@PathVariable Long applicationId,Authentication auth) {
        PlacementApplication app=applications.findById(applicationId).orElseThrow(()->new NoSuchElementException("Application not found"));
        AppUser caller=user(auth);
        if(caller.getRole()!=Role.ADMIN && (caller.getStudent()==null || !Objects.equals(caller.getStudent().getId(),app.getStudent().getId())))
            throw new org.springframework.security.access.AccessDeniedException("Not allowed to view this application.");
        return roundResults.findByApplicationId(applicationId);
    }
    @GetMapping("/drives/{driveId}/notifications")
    public List<NotificationLog> notificationStatus(@PathVariable Long driveId) {
        findDrive(driveId); return notificationLogs.findByDriveIdOrderByCreatedAtDesc(driveId);
    }
    @PostMapping("/drives/{driveId}/notifications/test")
    public Map<String,Object> testNotifications(@PathVariable Long driveId) {
        Drive d=findDrive(driveId); notifications.notifyEligible(d);
        return Map.of("message","Notification run completed using configured test/provider mode.","logs",notificationLogs.findByDriveIdOrderByCreatedAtDesc(driveId).size());
    }

    @GetMapping("/analytics") public Map<String,Object> analytics() {
        List<PlacementApplication> all=applications.findAll();
        Map<String,Long> byCompany=new TreeMap<>(), selectedCompany=new TreeMap<>(), byBranch=new TreeMap<>(), selectedBranch=new TreeMap<>();
        for(PlacementApplication a:all) {
            String c=a.getDrive().getCompany(), b=a.getStudent().getBranch();
            byCompany.merge(c,1L,Long::sum); byBranch.merge(b,1L,Long::sum);
            if(a.getStatus()==ApplicationStatus.SELECTED) { selectedCompany.merge(c,1L,Long::sum); selectedBranch.merge(b,1L,Long::sum); }
        }
        long selected=all.stream().filter(a->a.getStatus()==ApplicationStatus.SELECTED).count();
        return Map.of("totalApplications",all.size(),"selected",selected,"selectionRate",all.isEmpty()?0:Math.round(selected*1000.0/all.size())/10.0,
                "byCompany",byCompany,"selectedByCompany",selectedCompany,"byBranch",byBranch,"selectedByBranch",selectedBranch);
    }

    @GetMapping("/drives/{id}/export")
    public ResponseEntity<byte[]> export(@PathVariable Long id) throws IOException {
        Drive d=findDrive(id); List<PlacementApplication> list=applications.findByDriveIdOrderByAppliedAtDesc(id);
        try(Workbook wb=new XSSFWorkbook(); ByteArrayOutputStream out=new ByteArrayOutputStream()) {
            Sheet sh=wb.createSheet("Applicants");
            String[] headers={"Roll No","Name","Branch","CGPA","Arrears","Email","Status","Applied At","Answers"};
            Row hr=sh.createRow(0); for(int i=0;i<headers.length;i++) hr.createCell(i).setCellValue(headers[i]);
            int r=1; for(PlacementApplication a:list) {
                Row row=sh.createRow(r++); Student s=a.getStudent();
                row.createCell(0).setCellValue(s.getRollNo()); row.createCell(1).setCellValue(s.getName());
                row.createCell(2).setCellValue(s.getBranch()); row.createCell(3).setCellValue(s.getCgpa());
                row.createCell(4).setCellValue(s.getArrears()); row.createCell(5).setCellValue(s.getEmail()==null?"":s.getEmail());
                row.createCell(6).setCellValue(a.getStatus().name()); row.createCell(7).setCellValue(a.getAppliedAt().toString());
                row.createCell(8).setCellValue(a.getAnswers().toString());
            }
            for(int i=0;i<headers.length;i++) sh.autoSizeColumn(i);
            wb.write(out);
            return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=drivesync-"+id+"-applicants.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")).body(out.toByteArray());
        }
    }

    private Map<String,Object> driveSummary(Drive d, Student s) {
        Map<String,Object> m=new LinkedHashMap<>(); m.put("id",d.getId()); m.put("company",d.getCompany()); m.put("roleTitle",d.getRoleTitle());
        m.put("description",d.getDescription()); m.put("minCgpa",d.getMinCgpa()); m.put("maxArrears",d.getMaxArrears());
        m.put("branches",d.getBranches()); m.put("formQuestions",d.getFormQuestions()); m.put("createdAt",d.getCreatedAt());
        m.put("deadline",d.getDeadline()); m.put("active",d.isActive()); m.put("applicantCount",applications.countByDriveId(d.getId()));
        if(s!=null) { m.putAll(eligibility.check(s,d)); m.put("alreadyApplied",applications.existsByStudentIdAndDriveId(s.getId(),d.getId())); }
        return m;
    }
    private AppUser user(Authentication auth) { return users.findByEmailIgnoreCase(auth.getName()).orElseThrow(()->new NoSuchElementException("User account not found")); }
    private Student requireStudent(AppUser u) { if(u.getRole()!=Role.STUDENT||u.getStudent()==null) throw new IllegalArgumentException("A student account is required."); return u.getStudent(); }
    private Drive findDrive(Long id) { return drives.findById(id).orElseThrow(()->new NoSuchElementException("Drive not found")); }
    private String cell(Row row,int index) {
        Cell c=row.getCell(index,Row.MissingCellPolicy.RETURN_BLANK_AS_NULL); if(c==null)return "";
        return new DataFormatter().formatCellValue(c);
    }
    public record ApplyRequest(Long driveId, Map<String,String> answers) {}
    public record StatusRequest(String status) {}
    public record MobileRequest(String mobileNumber) {}
    public record RoundRequest(String name,String description,Integer sequenceNo,LocalDateTime scheduledAt) {}
    public record RoundResultRequest(Long applicationId,String result,String remarks) {}
}
