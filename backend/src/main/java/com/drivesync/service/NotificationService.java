package com.drivesync.service;

import com.drivesync.model.*;
import com.drivesync.repository.*;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.*;

@Service
public class NotificationService {
 private final StudentRepository students;
 private final NotificationLogRepository logs;
 private final EligibilityService eligibility;
 private final ObjectProvider<JavaMailSender> mailProvider;
 @Value("${drivesync.notifications.test-mode:true}") private boolean testMode;
 @Value("${drivesync.notifications.email-enabled:false}") private boolean emailEnabled;
 @Value("${drivesync.notifications.sms-enabled:false}") private boolean smsEnabled;
 @Value("${drivesync.notifications.from:no-reply@drivesync.local}") private String from;
 @Value("${drivesync.twilio.account-sid:}") private String sid;
 @Value("${drivesync.twilio.auth-token:}") private String token;
 @Value("${drivesync.twilio.from-number:}") private String twilioFrom;
 public NotificationService(StudentRepository students, NotificationLogRepository logs, EligibilityService eligibility,
                            ObjectProvider<JavaMailSender> mailProvider) {
  this.students=students; this.logs=logs; this.eligibility=eligibility; this.mailProvider=mailProvider;
 }
 public void notifyEligible(Drive drive) {
  for(Student s:students.findAll()) {
   if(!Boolean.TRUE.equals(eligibility.check(s,drive).get("eligible"))) continue;
   if(s.getEmail()!=null && !s.getEmail().toLowerCase(Locale.ROOT).endsWith("@student.local")
       && s.getEmail().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) sendEmail(drive,s);
   if(s.getMobileNumber()!=null && !s.getMobileNumber().isBlank()) sendSms(drive,s);
  }
 }
 private void sendEmail(Drive d,Student s) {
  NotificationLog existing=logs.findByDriveIdAndStudentIdAndChannel(d.getId(),s.getId(),"EMAIL").orElse(null);
  if(existing!=null && ("SENT".equals(existing.getStatus()) || (testMode && "TEST_MODE".equals(existing.getStatus())))) return;
  String status="SKIPPED", detail="Email notifications disabled";
  try {
   if(testMode) { status="TEST_MODE"; detail="Would email "+s.getEmail(); }
   else if(emailEnabled && mailProvider.getIfAvailable()!=null) {
    SimpleMailMessage m=new SimpleMailMessage(); m.setFrom(from); m.setTo(s.getEmail());
    m.setSubject("Placement Opportunity – "+d.getCompany());
    m.setText("Hello "+s.getName()+",\n\nA placement opportunity is available at "+d.getCompany()+" for the "+d.getRoleTitle()+" role.\n\nYou meet the eligibility criteria for this drive. Please log in to the DriveSync student portal and submit your application before the deadline.\n\nBest wishes,\nDriveSync Placement Team");
    mailProvider.getIfAvailable().send(m); status="SENT"; detail="Email sent to "+s.getEmail();
   }
  } catch(Exception ex) { status="FAILED"; detail=safe(ex); }
  save(d,s,"EMAIL",status,detail,existing);
 }
 private void sendSms(Drive d,Student s) {
  NotificationLog existing=logs.findByDriveIdAndStudentIdAndChannel(d.getId(),s.getId(),"SMS").orElse(null);
  if(existing!=null && ("SENT".equals(existing.getStatus()) || (testMode && "TEST_MODE".equals(existing.getStatus())))) return;
  String status="SKIPPED", detail="SMS notifications disabled";
  try {
   if(testMode) { status="TEST_MODE"; detail="Would send SMS to "+s.getMobileNumber(); }
   else if(smsEnabled && !sid.isBlank() && !token.isBlank() && !twilioFrom.isBlank()) {
    String body="DriveSync: You are eligible for "+d.getCompany()+" - "+d.getRoleTitle()+". Log in to DriveSync and apply before the deadline.";
    RestClient.create("https://api.twilio.com").post().uri("/2010-04-01/Accounts/"+sid+"/Messages.json")
      .headers(h->h.setBasicAuth(sid,token)).contentType(MediaType.APPLICATION_FORM_URLENCODED)
      .body("To="+enc(s.getMobileNumber())+"&From="+enc(twilioFrom)+"&Body="+enc(body)).retrieve().toBodilessEntity();
    status="SENT"; detail="SMS accepted by Twilio for "+s.getMobileNumber();
   }
  } catch(Exception ex) { status="FAILED"; detail=safe(ex); }
  save(d,s,"SMS",status,detail,existing);
 }
 private void save(Drive d,Student s,String channel,String status,String detail,NotificationLog existing) {
  NotificationLog l=existing==null?new NotificationLog():existing;
  l.setDriveId(d.getId()); l.setStudentId(s.getId()); l.setChannel(channel); l.setStatus(status); l.setDetail(detail); logs.save(l);
 }
 private String safe(Exception e) { String m=e.getMessage(); return m==null?"Provider error":m.substring(0,Math.min(950,m.length())); }
 private String enc(String s) { return java.net.URLEncoder.encode(s,java.nio.charset.StandardCharsets.UTF_8); }
}
