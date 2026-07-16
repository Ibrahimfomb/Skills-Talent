package com.skillset.application.service;

import com.skillset.application.dto.*;
import com.skillset.domain.entity.CandidateProfile;
import com.skillset.domain.entity.User;
import com.skillset.domain.entity.UserRole;
import com.skillset.domain.port.CandidateProfileRepositoryPort;
import com.skillset.domain.port.UserRepositoryPort;
import com.skillset.infrastructure.security.AuthorizationService;
import com.skillset.infrastructure.security.JwtUtil;
import com.skillset.infrastructure.util.CloudinaryService;
import com.skillset.infrastructure.util.EmailUtil;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepositoryPort   userRepositoryPort;
    private final PasswordEncoder      passwordEncoder;
    private final JwtUtil              jwtUtil;
    private final AuthorizationService authorizationService;
    private final SecretGenerator      secretGenerator;
    private final ZxingPngQrGenerator  qrGenerator;
    private final DefaultCodeVerifier  codeVerifier;
    private final CandidateProfileRepositoryPort candidateProfileRepositoryPort;
    private final CloudinaryService    cloudinaryService;
    private final EmailUtil            emailUtil;

    // ── Inscription ──────────────────────────────────────────────────────────

    public AuthResponse register(RegisterRequest request) {
        if (userRepositoryPort.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet email est déjà utilisé.");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.valueOf(request.getRole()));
        user.setIsActive(true);
        user.setTwoFactorEnabled(false);

        User saved = userRepositoryPort.saveUser(user);
        String token = jwtUtil.generateToken(saved.getId(), saved.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .id(saved.getId())
                .email(saved.getEmail())
                .firstName(saved.getFirstName())
                .lastName(saved.getLastName())
                .role(saved.getRole().toString())
                .onboardingCompleted(Boolean.TRUE.equals(saved.getOnboardingCompleted()))
                .build();
    }

    // ── Connexion ─────────────────────────────────────────────────────────────

    public AuthResponse login(LoginRequest request) {
        User user = userRepositoryPort.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect.");
        }

        if (!user.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Ce compte est désactivé.");
        }

        // 2FA activée : on retourne un token temporaire (pre-auth), pas encore le JWT complet
        if (Boolean.TRUE.equals(user.getTwoFactorEnabled()) && user.getTwoFactorSecret() != null) {
            return AuthResponse.builder()
                    .twoFactorRequired(true)
                    .preAuthToken(jwtUtil.generatePreAuthToken(user.getId()))
                    .build();
        }

        return buildFullResponse(user);
    }

    // ── 2FA — Configuration ───────────────────────────────────────────────────

    public TotpSetupResponse setup2fa(String userId) {
        User user = findUser(userId);

        if (Boolean.TRUE.equals(user.getTwoFactorEnabled())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "L'authentification à deux facteurs est déjà activée.");
        }

        String secret = secretGenerator.generate();
        user.setTwoFactorSecret(secret);
        userRepositoryPort.saveUser(user);

        QrData qrData = new QrData.Builder()
                .label(user.getEmail())
                .secret(secret)
                .issuer("SkillSet")
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();

        try {
            byte[] png = qrGenerator.generate(qrData);
            String base64 = "data:image/png;base64," + Base64.getEncoder().encodeToString(png);
            return new TotpSetupResponse(secret, qrData.getUri(), base64);
        } catch (QrGenerationException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Erreur lors de la génération du QR code.");
        }
    }

    public void confirm2faSetup(String userId, String code) {
        User user = findUser(userId);

        if (user.getTwoFactorSecret() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Initialisez d'abord la configuration 2FA (/2fa/setup).");
        }
        if (!codeVerifier.isValidCode(user.getTwoFactorSecret(), code)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Code invalide.");
        }

        user.setTwoFactorEnabled(true);
        userRepositoryPort.saveUser(user);
    }

    // ── 2FA — Vérification au login ───────────────────────────────────────────

    public AuthResponse verifyTotpLogin(TwoFactorLoginRequest request) {
        String userId;
        try {
            userId = jwtUtil.getUserIdFromPreAuthToken(request.getPreAuthToken());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Token de pré-authentification invalide ou expiré.");
        }

        User user = findUser(userId);

        if (!Boolean.TRUE.equals(user.getTwoFactorEnabled()) || user.getTwoFactorSecret() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La 2FA n'est pas activée sur ce compte.");
        }
        if (!codeVerifier.isValidCode(user.getTwoFactorSecret(), request.getCode())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Code invalide.");
        }

        return buildFullResponse(user);
    }

    // ── 2FA — Désactivation ───────────────────────────────────────────────────

    public void disable2fa(String userId, String code) {
        User user = findUser(userId);

        if (!Boolean.TRUE.equals(user.getTwoFactorEnabled()) || user.getTwoFactorSecret() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La 2FA n'est pas activée sur ce compte.");
        }
        if (!codeVerifier.isValidCode(user.getTwoFactorSecret(), code)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Code invalide. La 2FA n'a pas été désactivée.");
        }

        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        userRepositoryPort.saveUser(user);
    }

    // ── Profil utilisateur ────────────────────────────────────────────────────

    public UserDTO getUserProfile(String currentUserId, String userId) {
        authorizationService.requireSelfOrAdmin(currentUserId, userId);
        Optional<User> user = userRepositoryPort.findUserById(userId);
        return user.map(this::toDTO).orElse(null);
    }

    public UserDTO updateUser(String currentUserId, String userId, UserDTO details) {
        authorizationService.requireSelfOrAdmin(currentUserId, userId);
        return userRepositoryPort.findUserById(userId).map(user -> {
            if (details.getFirstName() != null) user.setFirstName(details.getFirstName());
            if (details.getLastName() != null) user.setLastName(details.getLastName());
            if (details.getPhoneNumber() != null) user.setPhoneNumber(details.getPhoneNumber());
            if (details.getProfilePictureUrl() != null) user.setProfilePictureUrl(details.getProfilePictureUrl());
            User saved = userRepositoryPort.saveUser(user);

            if (saved.getRole() == UserRole.CANDIDATE) {
                CandidateProfile profile = candidateProfileRepositoryPort.findByUserId(userId)
                        .orElseGet(() -> {
                            CandidateProfile p = new CandidateProfile();
                            p.setUserId(userId);
                            return p;
                        });
                if (details.getJobDomain() != null) profile.setJobDomain(details.getJobDomain());
                if (details.getDesiredRole() != null) profile.setDesiredRole(details.getDesiredRole());
                if (details.getExperienceLevel() != null) profile.setExperienceLevel(details.getExperienceLevel());
                if (details.getContractType() != null) profile.setContractType(details.getContractType());
                if (details.getLocation() != null) profile.setLocation(details.getLocation());
                if (details.getSkills() != null) profile.setSkills(details.getSkills());
                if (details.getBio() != null) profile.setBio(details.getBio());
                candidateProfileRepositoryPort.save(profile);
            }

            return toDTO(saved);
        }).orElse(null);
    }

    public UserDTO updateProfilePhoto(String currentUserId, String userId, MultipartFile file) {
        authorizationService.requireSelfOrAdmin(currentUserId, userId);
        User user = findUser(userId);
        String url = cloudinaryService.uploadImage(file);
        if (url == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Le stockage des images n'est pas configuré sur ce serveur.");
        }
        user.setProfilePictureUrl(url);
        return toDTO(userRepositoryPort.saveUser(user));
    }

    // ── Helpers privés ────────────────────────────────────────────────────────

    private User findUser(String userId) {
        return userRepositoryPort.findUserById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
    }

    private AuthResponse buildFullResponse(User user) {
        emailUtil.sendLoginNotification(user.getEmail(), user.getFirstName());

        return AuthResponse.builder()
                .token(jwtUtil.generateToken(user.getId(), user.getRole().name()))
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().toString())
                .onboardingCompleted(Boolean.TRUE.equals(user.getOnboardingCompleted()))
                .build();
    }

    private UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO(user.getId(), user.getEmail(), user.getFirstName(),
                user.getLastName(), user.getPhoneNumber(),
                user.getRole().toString(), user.getProfilePictureUrl());

        if (user.getRole() == UserRole.CANDIDATE) {
            candidateProfileRepositoryPort.findByUserId(user.getId()).ifPresent(profile -> {
                dto.setJobDomain(profile.getJobDomain());
                dto.setDesiredRole(profile.getDesiredRole());
                dto.setExperienceLevel(profile.getExperienceLevel());
                dto.setContractType(profile.getContractType());
                dto.setLocation(profile.getLocation());
                dto.setSkills(profile.getSkills());
                dto.setBio(profile.getBio());
            });
        }

        return dto;
    }
}
