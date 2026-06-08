package com.skillset.infrastructure.persistence;

import com.skillset.domain.entity.Application;
import com.skillset.domain.entity.ApplicationStatus;
import com.skillset.domain.port.ApplicationRepositoryPort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, String>, ApplicationRepositoryPort {
    List<Application> findByJobSeekerId(String jobSeekerId);
    List<Application> findByJobListingId(String jobListingId);
    long countByStatus(ApplicationStatus status);
    List<Application> findTop5ByOrderByAppliedAtDesc();
}
