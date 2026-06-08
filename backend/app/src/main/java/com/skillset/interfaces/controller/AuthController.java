package com.skillset.interfaces.controller;

import com.skillset.application.dto.*;
import com.skillset.application.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return new ResponseEntity<>(authService.register(request), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<UserDTO> getProfile(@PathVariable String userId) {
        UserDTO dto = authService.getUserProfile(userId);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<UserDTO> updateProfile(@PathVariable String userId,
                                                  @RequestBody UserDTO details) {
        UserDTO dto = authService.updateUser(userId, details);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }
}
