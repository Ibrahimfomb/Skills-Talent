package com.skillset.interfaces.controller;

import com.skillset.application.dto.ApplicationDTO;
import com.skillset.application.service.ApplicationService;
import com.skillset.domain.entity.Application;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {
    private final ApplicationService applicationService;
    
    @PostMapping
    public ResponseEntity<Application> submitApplication(@RequestBody Application application) {
        Application submittedApp = applicationService.submitApplication(application);
        return new ResponseEntity<>(submittedApp, HttpStatus.CREATED);
    }
    
    @GetMapping("/candidate/{jobSeekerId}")
    public ResponseEntity<List<ApplicationDTO>> getCandidateApplications(@PathVariable String jobSeekerId) {
        List<ApplicationDTO> applications = applicationService.getCandidateApplications(jobSeekerId);
        return ResponseEntity.ok(applications);
    }
    
    @GetMapping("/job/{jobListingId}")
    public ResponseEntity<List<ApplicationDTO>> getJobApplications(@PathVariable String jobListingId) {
        List<ApplicationDTO> applications = applicationService.getJobApplications(jobListingId);
        return ResponseEntity.ok(applications);
    }
    
    @GetMapping("/{applicationId}")
    public ResponseEntity<Application> getApplicationById(@PathVariable String applicationId) {
        var application = applicationService.getApplicationById(applicationId);
        if (application.isPresent()) {
            return ResponseEntity.ok(application.get());
        }
        return ResponseEntity.notFound().build();
    }
}
