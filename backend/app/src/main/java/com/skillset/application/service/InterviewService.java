package com.skillset.application.service;

import com.skillset.domain.entity.Interview;
import com.skillset.domain.port.InterviewRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InterviewService {
    private final InterviewRepositoryPort interviewRepositoryPort;
    
    public Interview scheduleInterview(Interview interview) {
        return interviewRepositoryPort.save(interview);
    }
    
    public List<Interview> getCandidateInterviews(String candidateId) {
        return interviewRepositoryPort.findByCandidateId(candidateId);
    }
    
    public List<Interview> getInterviewerSchedule(String interviewerId) {
        return interviewRepositoryPort.findByInterviewerId(interviewerId);
    }
    
    public Optional<Interview> getInterviewById(String interviewId) {
        return interviewRepositoryPort.findById(interviewId);
    }
    
    public Interview updateInterviewStatus(String interviewId, String status) {
        Optional<Interview> interview = interviewRepositoryPort.findById(interviewId);
        if (interview.isPresent()) {
            Interview interv = interview.get();
            interv.setStatus(status);
            return interviewRepositoryPort.save(interv);
        }
        return null;
    }
    
    public Interview addInterviewFeedback(String interviewId, String notes, Integer rating) {
        Optional<Interview> interview = interviewRepositoryPort.findById(interviewId);
        if (interview.isPresent()) {
            Interview interv = interview.get();
            interv.setNotes(notes);
            interv.setRating(rating);
            return interviewRepositoryPort.save(interv);
        }
        return null;
    }
}
