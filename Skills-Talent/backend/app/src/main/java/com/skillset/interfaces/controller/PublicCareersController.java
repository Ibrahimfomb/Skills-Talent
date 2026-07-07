package com.skillset.interfaces.controller;

import com.skillset.application.dto.JobListingDTO;
import com.skillset.application.dto.PublicCareersDto;
import com.skillset.domain.entity.JobListing;
import com.skillset.domain.entity.JobStatus;
import com.skillset.infrastructure.persistence.EmployerProfileRepository;
import com.skillset.infrastructure.persistence.JobListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/careers")
@RequiredArgsConstructor
public class PublicCareersController {

    private final EmployerProfileRepository employerProfileRepository;
    private final JobListingRepository      jobListingRepository;

    @GetMapping("/{slug}")
    public ResponseEntity<PublicCareersDto> getCareerPage(@PathVariable String slug) {
        return employerProfileRepository.findByCompanySlug(slug)
            .map(profile -> {
                List<JobListingDTO> jobs = jobListingRepository
                    .findByCompanyIdAndStatus(profile.getUserId(), JobStatus.OPEN)
                    .stream()
                    .map(this::toDto)
                    .toList();
                return ResponseEntity.ok(new PublicCareersDto(
                    profile.getCompanySlug(),
                    profile.getCompanyName(),
                    profile.getIndustry(),
                    profile.getCompanySize(),
                    profile.getCompanyCity(),
                    profile.getCompanyCountry(),
                    profile.getCompanyWebsite(),
                    profile.getCompanyLinkedIn(),
                    jobs
                ));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    private JobListingDTO toDto(JobListing j) {
        return new JobListingDTO(
            j.getId(), j.getTitle(), j.getDescription(), j.getCompanyId(),
            j.getLocation(), j.getJobType(), j.getSalaryMin(), j.getSalaryMax(),
            j.getRequiredSkills(), j.getResponsibilities(), j.getStatus().name()
        );
    }
}
