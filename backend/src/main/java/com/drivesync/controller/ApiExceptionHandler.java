package com.drivesync.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(NoSuchElementException.class)
    ResponseEntity<?> notFound(Exception e) { return ResponseEntity.status(404).body(Map.of("message",e.getMessage())); }
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    ResponseEntity<?> forbidden(Exception e) { return ResponseEntity.status(403).body(Map.of("message","You are not authorized to access this resource.")); }
    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<?> badRequest(Exception e) { return ResponseEntity.badRequest().body(Map.of("message",e.getMessage())); }
    @ExceptionHandler(Exception.class)
    ResponseEntity<?> generic(Exception e) {
        return ResponseEntity.status(500).body(Map.of("message","Unexpected server error. Check backend logs for details."));
    }
}
