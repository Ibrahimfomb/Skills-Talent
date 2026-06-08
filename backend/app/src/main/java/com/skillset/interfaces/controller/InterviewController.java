package com.skillset.interfaces.controller;

import com.skillset.application.service.InterviewService;
import com.skillset.domain.entity.Interview;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {
    private final InterviewService interviewService;
    
    @PostMapping
    public ResponseEntity<Interview> scheduleInterview(@RequestBody Interview interview) {
        Interview scheduledInterview = interviewService.scheduleInterview(interview);
        return new ResponseEntity<>(scheduledInterview, HttpStatus.CREATED);
    }
    
    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<Interview>> getCandidateInterviews(@PathVariable String candidateId) {
        List<Interview> interviews = interviewService.getCandidateInterviews(candidateId);
        return ResponseEntity.ok(interviews);
    }
    
    @GetMapping("/interviewer/{interviewerId}")
    public ResponseEntity<List<Interview>> getInterviewerSchedule(@PathVariable String interviewerId) {
        List<Interview> interviews = interviewService.getInterviewerSchedule(interviewerId);
        return ResponseEntity.ok(interviews);
    }
    
    @GetMapping("/{interviewId}")
    public ResponseEntity<Interview> getInterviewById(@PathVariable String interviewId) {
        var interview = interviewService.getInterviewById(interviewId);
        if (interview.isPresent()) {
            return ResponseEntity.ok(interview.get());
        }
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/{interviewId}/status")
    public ResponseEntity<Interview> updateInterviewStatus(@PathVariable String interviewId, @RequestParam String status) {
        Interview updatedInterview = interviewService.updateInterviewStatus(interviewId, status);
        if (updatedInterview != null) {
            return ResponseEntity.ok(updatedInterview);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/{interviewId}/feedback")
    public ResponseEntity<Interview> addFeedback(@PathVariable String interviewId, @RequestParam String notes, @RequestParam Integer rating) {
        Interview updatedInterview = interviewService.addInterviewFeedback(interviewId, notes, rating);
        if (updatedInterview != null) {
            return ResponseEntity.ok(updatedInterview);
        }
        return ResponseEntity.notFound().build();
    }
}
