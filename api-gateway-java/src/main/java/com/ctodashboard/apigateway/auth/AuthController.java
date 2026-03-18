package com.ctodashboard.apigateway.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Handles username/password login and returns a signed JWT.
 *
 * POST /auth/login
 * Body: { "username": "admin", "password": "admin123" }
 * Response: { "token": "<JWT>", "username": "admin", "roles": ["ADMIN"] }
 *
 * Users are defined via application.yml so no database round-trip is needed.
 * In production replace with a UserRepository lookup.
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final JwtTokenService jwtTokenService;
    private final PasswordEncoder passwordEncoder;
    private final UserStore userStore;

    public AuthController(JwtTokenService jwtTokenService,
                          PasswordEncoder passwordEncoder,
                          UserStore userStore) {
        this.jwtTokenService = jwtTokenService;
        this.passwordEncoder = passwordEncoder;
        this.userStore = userStore;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {

        UserStore.AppUser user = userStore.findByUsername(req.username());
        if (user == null || !passwordEncoder.matches(req.password(), user.hashedPassword())) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid username or password"));
        }

        String token = jwtTokenService.generateToken(user.username(), user.orgId(), user.roles());

        return ResponseEntity.ok(Map.of(
                "token",    token,
                "username", user.username(),
                "orgId",    user.orgId(),
                "roles",    user.roles()
        ));
    }

    public record LoginRequest(String username, String password) {}
}
