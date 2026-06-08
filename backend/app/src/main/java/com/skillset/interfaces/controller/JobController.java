package com.skillset.interfaces.controller;

import com.skillset.application.dto.JobListingDTO;
import com.skillset.application.service.JobService;
import com.skillset.domain.entity.JobListing;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {
    private final JobService jobService;
    
    @PostMapping
    public ResponseEntity<JobListing> createJob(@RequestBody JobListing jobListing) {
        JobListing createdJob = jobService.createJob(jobListing);
        return new ResponseEntity<>(createdJob, HttpStatus.CREATED);
    }
    
    @GetMapping
    public ResponseEntity<List<JobListingDTO>> getAllOpenJobs() {
        List<JobListingDTO> jobs = jobService.getAllJobs();
        return ResponseEntity.ok(jobs);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<JobListingDTO>> searchJobs(@RequestParam String location) {
        List<JobListingDTO> jobs = jobService.getJobsByLocation(location);
        return ResponseEntity.ok(jobs);
    }
    
    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<JobListingDTO>> getCompanyJobs(@PathVariable String companyId) {
        List<JobListingDTO> jobs = jobService.getCompanyJobs(companyId);
        return ResponseEntity.ok(jobs);
    }
    
    @GetMapping("/{jobId}")
    public ResponseEntity<JobListing> getJobById(@PathVariable String jobId) {
        var job = jobService.getJobById(jobId);
        if (job.isPresent()) {
            return ResponseEntity.ok(job.get());
        }
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/{jobId}")
    public ResponseEntity<JobListing> updateJob(@PathVariable String jobId, @RequestBody JobListing jobDetails) {
        JobListing updatedJob = jobService.updateJob(jobId, jobDetails);
        if (updatedJob != null) {
            return ResponseEntity.ok(updatedJob);
        }
        return ResponseEntity.notFound().build();
    }
}
