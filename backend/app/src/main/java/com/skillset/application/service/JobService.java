package com.skillset.application.service;

import com.skillset.application.dto.JobListingDTO;
import com.skillset.domain.entity.JobListing;
import com.skillset.domain.port.JobRepositoryPort;
import com.skillset.infrastructure.security.AuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {
    private final JobRepositoryPort jobRepositoryPort;
    private final AuthorizationService authorizationService;

    public JobListing createJob(String employerId, JobListing jobListing) {
        jobListing.setCompanyId(employerId);
        return jobRepositoryPort.save(jobListing);
    }

    public List<JobListingDTO> getAllJobs() {
        return jobRepositoryPort.findAll()
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<JobListingDTO> getJobsByLocation(String location) {
        return jobRepositoryPort.findByLocation(location)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<JobListingDTO> getCompanyJobs(String currentUserId, String companyId) {
        authorizationService.requireSelfOrAdmin(currentUserId, companyId);
        return jobRepositoryPort.findByCompanyId(companyId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public Optional<JobListing> getJobById(String jobId) {
        return jobRepositoryPort.findById(jobId);
    }

    public JobListing updateJob(String currentUserId, String jobId, JobListing jobDetails) {
        authorizationService.requireJobOwner(currentUserId, jobId);
        Optional<JobListing> job = jobRepositoryPort.findById(jobId);
        if (job.isPresent()) {
            JobListing existing = job.get();
            existing.setTitle(jobDetails.getTitle());
            existing.setDescription(jobDetails.getDescription());
            existing.setLocation(jobDetails.getLocation());
            existing.setJobType(jobDetails.getJobType());
            existing.setSalaryMin(jobDetails.getSalaryMin());
            existing.setSalaryMax(jobDetails.getSalaryMax());
            return jobRepositoryPort.save(existing);
        }
        return null;
    }

    private JobListingDTO convertToDTO(JobListing job) {
        return new JobListingDTO(
            job.getId(),
            job.getTitle(),
            job.getDescription(),
            job.getCompanyId(),
            job.getLocation(),
            job.getJobType(),
            job.getSalaryMin(),
            job.getSalaryMax(),
            job.getRequiredSkills(),
            job.getResponsibilities(),
            job.getStatus().toString()
        );
    }
}
