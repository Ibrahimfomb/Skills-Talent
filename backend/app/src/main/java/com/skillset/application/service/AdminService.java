package com.skillset.application.service;

import com.skillset.application.dto.AdminStatsDto;
import com.skillset.domain.entity.*;
import com.skillset.infrastructure.persistence.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final JobListingRepository jobListingRepository;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    private void requireAdmin(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
        if (user.getRole() != UserRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès réservé aux administrateurs");
        }
    }

    public AdminStatsDto getStats(String adminUserId) {
        requireAdmin(adminUserId);

        long totalUsers        = userRepository.count();
        long totalCandidates   = userRepository.countByRole(UserRole.CANDIDATE);
        long totalEmployers    = userRepository.countByRole(UserRole.EMPLOYER);
        long activeUsers       = userRepository.countByIsActive(true);
        long totalJobs         = jobListingRepository.count();
        long openJobs          = jobListingRepository.countByStatus(JobStatus.OPEN);
        long totalApps         = applicationRepository.count();
        long pendingApps       = applicationRepository.countByStatus(ApplicationStatus.SUBMITTED)
                               + applicationRepository.countByStatus(ApplicationStatus.SCREENING);
        long acceptedApps      = applicationRepository.countByStatus(ApplicationStatus.APPROVED);
        long rejectedApps      = applicationRepository.countByStatus(ApplicationStatus.REJECTED);

        List<AdminStatsDto.UserSummary> recentUsers = userRepository.findTop10ByOrderByCreatedAtDesc()
                .stream().map(this::toSummary).collect(Collectors.toList());

        return AdminStatsDto.builder()
                .totalUsers(totalUsers)
                .totalCandidates(totalCandidates)
                .totalEmployers(totalEmployers)
                .activeUsers(activeUsers)
                .totalJobs(totalJobs)
                .openJobs(openJobs)
                .totalApplications(totalApps)
                .pendingApplications(pendingApps)
                .acceptedApplications(acceptedApps)
                .rejectedApplications(rejectedApps)
                .recentUsers(recentUsers)
                .recentActivity(buildActivity())
                .build();
    }

    public List<AdminStatsDto.UserSummary> searchUsers(String adminUserId, String query) {
        requireAdmin(adminUserId);
        List<User> users = (query == null || query.isBlank())
                ? userRepository.findAll()
                : userRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        query, query, query);
        return users.stream().map(this::toSummary).collect(Collectors.toList());
    }

    public void toggleUserStatus(String adminUserId, String targetUserId) {
        requireAdmin(adminUserId);
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
        target.setIsActive(!Boolean.TRUE.equals(target.getIsActive()));
        userRepository.save(target);
    }

    private AdminStatsDto.UserSummary toSummary(User u) {
        return AdminStatsDto.UserSummary.builder()
                .id(u.getId())
                .name(u.getFirstName() + " " + u.getLastName())
                .email(u.getEmail())
                .role(u.getRole().name())
                .status(Boolean.TRUE.equals(u.getIsActive()) ? "ACTIVE" : "INACTIVE")
                .joinedAt(u.getCreatedAt() != null ? u.getCreatedAt().format(FMT) : "—")
                .build();
    }

    private List<AdminStatsDto.ActivityItem> buildActivity() {
        List<AdminStatsDto.ActivityItem> items = new ArrayList<>();

        userRepository.findTop5ByOrderByCreatedAtDesc().forEach(u ->
            items.add(AdminStatsDto.ActivityItem.builder()
                .message((u.getRole() == UserRole.CANDIDATE
                        ? "Nouveau candidat inscrit : "
                        : u.getRole() == UserRole.EMPLOYER
                            ? "Nouvel employeur inscrit : "
                            : "Nouvel admin : ")
                        + u.getFirstName() + " " + u.getLastName())
                .type("user")
                .time(u.getCreatedAt() != null ? u.getCreatedAt().format(FMT) : "—")
                .build())
        );

        applicationRepository.findTop5ByOrderByAppliedAtDesc().forEach(a ->
            items.add(AdminStatsDto.ActivityItem.builder()
                .message("Candidature soumise — " +
                        (a.getJobListing() != null ? a.getJobListing().getTitle() : "offre inconnue"))
                .type("file")
                .time(a.getAppliedAt() != null ? a.getAppliedAt().format(FMT) : "—")
                .build())
        );

        jobListingRepository.findTop5ByOrderByPostedAtDesc().forEach(j ->
            items.add(AdminStatsDto.ActivityItem.builder()
                .message("Offre publiée : " + j.getTitle())
                .type("job")
                .time(j.getPostedAt() != null ? j.getPostedAt().format(FMT) : "—")
                .build())
        );

        return items.stream().limit(10).collect(Collectors.toList());
    }
}
