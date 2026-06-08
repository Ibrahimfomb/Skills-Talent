package com.skillset.infrastructure.persistence;

import com.skillset.domain.entity.JobListing;
import com.skillset.domain.entity.JobStatus;
import com.skillset.domain.port.JobRepositoryPort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobListingRepository extends JpaRepository<JobListing, String>, JobRepositoryPort {
    List<JobListing> findByCompanyId(String companyId);
    List<JobListing> findByLocation(String location);
    long countByStatus(JobStatus status);
    List<JobListing> findTop5ByOrderByPostedAtDesc();
}
