package com.skillset.infrastructure.config;

import com.skillset.domain.entity.User;
import com.skillset.domain.entity.UserRole;
import com.skillset.domain.port.UserRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepositoryPort userRepositoryPort;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createAdminIfAbsent(
            "Admin",
            "SkillSet",
            "admin@skillset.com",
            "Admin@SkillSet2026"
        );
        createAdminIfAbsent(
            "Super",
            "Admin",
            "superadmin@skillset.com",
            "Super@SkillSet2026"
        );
    }

    private void createAdminIfAbsent(String firstName, String lastName, String email, String rawPassword) {
        if (userRepositoryPort.existsByEmail(email)) {
            log.info("Admin account already exists: {}", email);
            return;
        }
        User admin = new User();
        admin.setFirstName(firstName);
        admin.setLastName(lastName);
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(rawPassword));
        admin.setRole(UserRole.ADMIN);
        admin.setIsActive(true);
        admin.setTwoFactorEnabled(false);
        admin.setOnboardingCompleted(true);
        userRepositoryPort.saveUser(admin);
        log.info("Admin account created: {}", email);
    }
}
