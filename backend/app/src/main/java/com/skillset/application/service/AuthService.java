package com.skillset.application.service;

import com.skillset.application.dto.*;
import com.skillset.domain.entity.User;
import com.skillset.domain.entity.UserRole;
import com.skillset.domain.port.UserRepositoryPort;
import com.skillset.infrastructure.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepositoryPort userRepositoryPort;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

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
        String token = jwtUtil.generateToken(saved.getId());

        return new AuthResponse(token, saved.getId(), saved.getEmail(),
                saved.getFirstName(), saved.getLastName(), saved.getRole().toString(),
                Boolean.TRUE.equals(saved.getOnboardingCompleted()));
    }

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

        String token = jwtUtil.generateToken(user.getId());

        return new AuthResponse(token, user.getId(), user.getEmail(),
                user.getFirstName(), user.getLastName(), user.getRole().toString(),
                Boolean.TRUE.equals(user.getOnboardingCompleted()));
    }

    public UserDTO getUserProfile(String userId) {
        Optional<User> user = userRepositoryPort.findUserById(userId);
        return user.map(this::toDTO).orElse(null);
    }

    public UserDTO updateUser(String userId, UserDTO details) {
        return userRepositoryPort.findUserById(userId).map(user -> {
            user.setFirstName(details.getFirstName());
            user.setLastName(details.getLastName());
            user.setPhoneNumber(details.getPhoneNumber());
            user.setProfilePictureUrl(details.getProfilePictureUrl());
            return toDTO(userRepositoryPort.saveUser(user));
        }).orElse(null);
    }

    private UserDTO toDTO(User user) {
        return new UserDTO(user.getId(), user.getEmail(), user.getFirstName(),
                user.getLastName(), user.getPhoneNumber(),
                user.getRole().toString(), user.getProfilePictureUrl());
    }
}
