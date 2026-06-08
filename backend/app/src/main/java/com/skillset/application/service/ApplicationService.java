package com.skillset.application.service;

import com.skillset.application.dto.ApplicationDTO;
import com.skillset.domain.entity.Application;
import com.skillset.domain.port.ApplicationRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {
    private final ApplicationRepositoryPort applicationRepositoryPort;
    
    public Application submitApplication(Application application) {
        return applicationRepositoryPort.save(application);
    }
    
    public List<ApplicationDTO> getCandidateApplications(String jobSeekerId) {
        return applicationRepositoryPort.findByJobSeekerId(jobSeekerId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<ApplicationDTO> getJobApplications(String jobListingId) {
        return applicationRepositoryPort.findByJobListingId(jobListingId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public Optional<Application> getApplicationById(String applicationId) {
        return applicationRepositoryPort.findById(applicationId);
    }
    
    private ApplicationDTO convertToDTO(Application app) {
        return new ApplicationDTO(
            app.getId(),
            app.getJobSeekerId(),
            app.getJobListing().getId(),
            app.getCoverLetter(),
            app.getCvUrl(),
            app.getStatus().toString(),
            app.getMatchScore()
        );
    }
}
