package com.skillset.application.service;

import com.skillset.domain.entity.Interview;
import com.skillset.domain.port.InterviewRepositoryPort;
import com.skillset.infrastructure.security.AuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InterviewService {
    private final InterviewRepositoryPort  interviewRepositoryPort;
    private final AuthorizationService     authorizationService;
    private final NotificationPushService  notificationPushService;

    private static final DateTimeFormatter FMT_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm");

    public Interview scheduleInterview(String employerId, Interview interview) {
        interview.setInterviewerId(employerId);
        Interview saved = interviewRepositoryPort.save(interview);

        String when = saved.getScheduledAt() != null ? saved.getScheduledAt().format(FMT_DATE) : "date à confirmer";
        String body  = "Un entretien " + (saved.getInterviewType() != null ? saved.getInterviewType().toLowerCase() : "")
                     + " a été planifié le " + when + ".";
        if (saved.getCalendlyLink() != null && !saved.getCalendlyLink().isBlank()) {
            body += " Confirmez via Calendly.";
        }
        notificationPushService.push(saved.getCandidateId(), "interview", "Entretien planifié 📅", body, "/applications");
        return saved;
    }

    public List<Interview> getCandidateInterviews(String currentUserId, String candidateId) {
        authorizationService.requireSelfOrAdmin(currentUserId, candidateId);
        return interviewRepositoryPort.findByCandidateId(candidateId);
    }

    public List<Interview> getInterviewerSchedule(String currentUserId, String interviewerId) {
        authorizationService.requireSelfOrAdmin(currentUserId, interviewerId);
        return interviewRepositoryPort.findByInterviewerId(interviewerId);
    }

    public Optional<Interview> getInterviewById(String currentUserId, String interviewId) {
        Optional<Interview> interview = interviewRepositoryPort.findById(interviewId);
        interview.ifPresent(i -> authorizationService.requireInterviewAccess(currentUserId, i));
        return interview;
    }

    public Interview updateInterviewStatus(String currentUserId, String interviewId, String status) {
        return updateInterview(currentUserId, interviewId, interv -> interv.setStatus(status));
    }

    public Interview addInterviewFeedback(String currentUserId, String interviewId, String notes, Integer rating) {
        return updateInterview(currentUserId, interviewId, interv -> {
            interv.setNotes(notes);
            interv.setRating(rating);
        });
    }

    private Interview updateInterview(String currentUserId, String interviewId,
                                      java.util.function.Consumer<Interview> updater) {
        Optional<Interview> interview = interviewRepositoryPort.findById(interviewId);
        if (interview.isEmpty()) {
            return null;
        }
        Interview interv = interview.get();
        authorizationService.requireInterviewAccess(currentUserId, interv);
        updater.accept(interv);
        return interviewRepositoryPort.save(interv);
    }
}
