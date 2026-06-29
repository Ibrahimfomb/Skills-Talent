package com.skillset.application.service;

import com.skillset.application.dto.*;
import com.skillset.domain.entity.User;
import com.skillset.domain.entity.UserRole;
import com.skillset.domain.port.UserRepositoryPort;
import com.skillset.infrastructure.security.AuthorizationService;
import com.skillset.infrastructure.security.JwtUtil;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService")
class AuthServiceTest {

    @Mock UserRepositoryPort   userRepositoryPort;
    @Mock PasswordEncoder      passwordEncoder;
    @Mock JwtUtil              jwtUtil;
    @Mock AuthorizationService authorizationService;
    @Mock SecretGenerator      secretGenerator;
    @Mock ZxingPngQrGenerator  qrGenerator;
    @Mock DefaultCodeVerifier  codeVerifier;

    @InjectMocks AuthService authService;

    // ── Helpers ───────────────────────────────────────────────────────────────

    private User activeUser() {
        User u = new User();
        u.setId("user-1");
        u.setEmail("alice@example.com");
        u.setPassword("hashed");
        u.setFirstName("Alice");
        u.setLastName("Dupont");
        u.setRole(UserRole.CANDIDATE);
        u.setIsActive(true);
        u.setTwoFactorEnabled(false);
        u.setOnboardingCompleted(false);
        return u;
    }

    private RegisterRequest registerRequest() {
        RegisterRequest r = new RegisterRequest();
        r.setFirstName("Alice");
        r.setLastName("Dupont");
        r.setEmail("alice@example.com");
        r.setPassword("secret");
        r.setRole("CANDIDATE");
        return r;
    }

    // ── register() ────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("register()")
    class Register {

        @Test
        @DisplayName("retourne un token JWT après inscription réussie")
        void success_returnsToken() {
            when(userRepositoryPort.existsByEmail("alice@example.com")).thenReturn(false);
            when(passwordEncoder.encode("secret")).thenReturn("hashed");
            User saved = activeUser();
            when(userRepositoryPort.saveUser(any())).thenReturn(saved);
            when(jwtUtil.generateToken("user-1", "CANDIDATE")).thenReturn("jwt-token");

            AuthResponse response = authService.register(registerRequest());

            assertThat(response.getToken()).isEqualTo("jwt-token");
            assertThat(response.getEmail()).isEqualTo("alice@example.com");
            assertThat(response.getRole()).isEqualTo("CANDIDATE");
        }

        @Test
        @DisplayName("lève CONFLICT si l'email est déjà utilisé")
        void emailTaken_throwsConflict() {
            when(userRepositoryPort.existsByEmail("alice@example.com")).thenReturn(true);

            assertThatThrownBy(() -> authService.register(registerRequest()))
                    .isInstanceOf(ResponseStatusException.class)
                    .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                    .isEqualTo(HttpStatus.CONFLICT);
        }
    }

    // ── login() ───────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("login()")
    class Login {

        private LoginRequest loginRequest() {
            LoginRequest r = new LoginRequest();
            r.setEmail("alice@example.com");
            r.setPassword("secret");
            return r;
        }

        @Test
        @DisplayName("retourne un JWT complet quand la 2FA est désactivée")
        void noTwoFactor_returnsFullJwt() {
            User user = activeUser();
            when(userRepositoryPort.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("secret", "hashed")).thenReturn(true);
            when(jwtUtil.generateToken("user-1", "CANDIDATE")).thenReturn("full-jwt");

            AuthResponse response = authService.login(loginRequest());

            assertThat(response.getToken()).isEqualTo("full-jwt");
            assertThat(response.isTwoFactorRequired()).isFalse();
        }

        @Test
        @DisplayName("retourne preAuthToken quand la 2FA est activée")
        void twoFactorEnabled_returnsPreAuthToken() {
            User user = activeUser();
            user.setTwoFactorEnabled(true);
            user.setTwoFactorSecret("TOTP_SECRET");
            when(userRepositoryPort.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("secret", "hashed")).thenReturn(true);
            when(jwtUtil.generatePreAuthToken("user-1")).thenReturn("pre-auth-jwt");

            AuthResponse response = authService.login(loginRequest());

            assertThat(response.isTwoFactorRequired()).isTrue();
            assertThat(response.getPreAuthToken()).isEqualTo("pre-auth-jwt");
            assertThat(response.getToken()).isNull();
        }

        @Test
        @DisplayName("lève UNAUTHORIZED si l'utilisateur est introuvable")
        void userNotFound_throwsUnauthorized() {
            when(userRepositoryPort.findByEmail("alice@example.com")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login(loginRequest()))
                    .isInstanceOf(ResponseStatusException.class)
                    .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                    .isEqualTo(HttpStatus.UNAUTHORIZED);
        }

        @Test
        @DisplayName("lève UNAUTHORIZED si le mot de passe est incorrect")
        void wrongPassword_throwsUnauthorized() {
            User user = activeUser();
            when(userRepositoryPort.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("secret", "hashed")).thenReturn(false);

            assertThatThrownBy(() -> authService.login(loginRequest()))
                    .isInstanceOf(ResponseStatusException.class)
                    .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                    .isEqualTo(HttpStatus.UNAUTHORIZED);
        }

        @Test
        @DisplayName("lève FORBIDDEN si le compte est désactivé")
        void inactiveAccount_throwsForbidden() {
            User user = activeUser();
            user.setIsActive(false);
            when(userRepositoryPort.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("secret", "hashed")).thenReturn(true);

            assertThatThrownBy(() -> authService.login(loginRequest()))
                    .isInstanceOf(ResponseStatusException.class)
                    .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                    .isEqualTo(HttpStatus.FORBIDDEN);
        }
    }

    // ── setup2fa() ────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("setup2fa()")
    class Setup2fa {

        @Test
        @DisplayName("génère un secret et retourne un QR code base64")
        void success_returnsQrCode() throws QrGenerationException {
            User user = activeUser();
            when(userRepositoryPort.findUserById("user-1")).thenReturn(Optional.of(user));
            when(secretGenerator.generate()).thenReturn("MYSECRET");
            when(userRepositoryPort.saveUser(any())).thenReturn(user);
            when(qrGenerator.generate(any(QrData.class))).thenReturn(new byte[]{1, 2, 3});

            TotpSetupResponse response = authService.setup2fa("user-1");

            assertThat(response.getSecret()).isEqualTo("MYSECRET");
            assertThat(response.getQrCodeImageBase64()).startsWith("data:image/png;base64,");
        }

        @Test
        @DisplayName("lève CONFLICT si la 2FA est déjà activée")
        void alreadyEnabled_throwsConflict() {
            User user = activeUser();
            user.setTwoFactorEnabled(true);
            when(userRepositoryPort.findUserById("user-1")).thenReturn(Optional.of(user));

            assertThatThrownBy(() -> authService.setup2fa("user-1"))
                    .isInstanceOf(ResponseStatusException.class)
                    .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                    .isEqualTo(HttpStatus.CONFLICT);
        }
    }

    // ── confirm2faSetup() ─────────────────────────────────────────────────────

    @Nested
    @DisplayName("confirm2faSetup()")
    class Confirm2fa {

        @Test
        @DisplayName("active la 2FA si le code est valide")
        void validCode_enables2fa() {
            User user = activeUser();
            user.setTwoFactorSecret("MYSECRET");
            when(userRepositoryPort.findUserById("user-1")).thenReturn(Optional.of(user));
            when(codeVerifier.isValidCode("MYSECRET", "123456")).thenReturn(true);

            authService.confirm2faSetup("user-1", "123456");

            assertThat(user.getTwoFactorEnabled()).isTrue();
            verify(userRepositoryPort).saveUser(user);
        }

        @Test
        @DisplayName("lève UNAUTHORIZED si le code est invalide")
        void invalidCode_throwsUnauthorized() {
            User user = activeUser();
            user.setTwoFactorSecret("MYSECRET");
            when(userRepositoryPort.findUserById("user-1")).thenReturn(Optional.of(user));
            when(codeVerifier.isValidCode("MYSECRET", "000000")).thenReturn(false);

            assertThatThrownBy(() -> authService.confirm2faSetup("user-1", "000000"))
                    .isInstanceOf(ResponseStatusException.class)
                    .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                    .isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    // ── verifyTotpLogin() ─────────────────────────────────────────────────────

    @Nested
    @DisplayName("verifyTotpLogin()")
    class VerifyTotpLogin {

        @Test
        @DisplayName("retourne un JWT complet après vérification TOTP réussie")
        void validToken_returnsFullJwt() {
            User user = activeUser();
            user.setTwoFactorEnabled(true);
            user.setTwoFactorSecret("MYSECRET");
            TwoFactorLoginRequest req = new TwoFactorLoginRequest();
            req.setPreAuthToken("pre-auth-jwt");
            req.setCode("123456");

            when(jwtUtil.getUserIdFromPreAuthToken("pre-auth-jwt")).thenReturn("user-1");
            when(userRepositoryPort.findUserById("user-1")).thenReturn(Optional.of(user));
            when(codeVerifier.isValidCode("MYSECRET", "123456")).thenReturn(true);
            when(jwtUtil.generateToken("user-1", "CANDIDATE")).thenReturn("full-jwt");

            AuthResponse response = authService.verifyTotpLogin(req);

            assertThat(response.getToken()).isEqualTo("full-jwt");
        }

        @Test
        @DisplayName("lève UNAUTHORIZED si le pre-auth token est invalide")
        void invalidPreAuthToken_throwsUnauthorized() {
            TwoFactorLoginRequest req = new TwoFactorLoginRequest();
            req.setPreAuthToken("bad-token");
            req.setCode("123456");
            when(jwtUtil.getUserIdFromPreAuthToken("bad-token"))
                    .thenThrow(new RuntimeException("token invalide"));

            assertThatThrownBy(() -> authService.verifyTotpLogin(req))
                    .isInstanceOf(ResponseStatusException.class)
                    .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                    .isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    // ── disable2fa() ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("disable2fa()")
    class Disable2fa {

        @Test
        @DisplayName("désactive la 2FA si le code est valide")
        void validCode_disables2fa() {
            User user = activeUser();
            user.setTwoFactorEnabled(true);
            user.setTwoFactorSecret("MYSECRET");
            when(userRepositoryPort.findUserById("user-1")).thenReturn(Optional.of(user));
            when(codeVerifier.isValidCode("MYSECRET", "123456")).thenReturn(true);

            authService.disable2fa("user-1", "123456");

            assertThat(user.getTwoFactorEnabled()).isFalse();
            assertThat(user.getTwoFactorSecret()).isNull();
        }

        @Test
        @DisplayName("lève BAD_REQUEST si la 2FA n'est pas activée")
        void notEnabled_throwsBadRequest() {
            User user = activeUser();
            when(userRepositoryPort.findUserById("user-1")).thenReturn(Optional.of(user));

            assertThatThrownBy(() -> authService.disable2fa("user-1", "123456"))
                    .isInstanceOf(ResponseStatusException.class)
                    .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                    .isEqualTo(HttpStatus.BAD_REQUEST);
        }
    }
}
