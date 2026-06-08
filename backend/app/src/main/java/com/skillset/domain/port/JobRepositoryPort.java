package com.skillset.domain.port;

import com.skillset.domain.entity.JobListing;
import java.util.List;
import java.util.Optional;

public interface JobRepositoryPort {
    JobListing save(JobListing jobListing);
    Optional<JobListing> findById(String id);
    List<JobListing> findAll();
    List<JobListing> findByCompanyId(String companyId);
    List<JobListing> findByLocation(String location);
}
