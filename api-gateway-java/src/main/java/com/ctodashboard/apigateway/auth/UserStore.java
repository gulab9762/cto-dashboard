package com.ctodashboard.apigateway.auth;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * In-memory user store loaded from application.yml.
 *
 * yml structure (under {@code app.users}):
 * <pre>
 * app:
 *   users:
 *     - username: admin
 *       hashedPassword: $2a$10$...   # BCrypt hash
 *       orgId: gulab9762
 *       roles: [ADMIN]
 * </pre>
 *
 * Passwords are BCrypt-hashed. Generate a hash with:
 *   new BCryptPasswordEncoder().encode("yourpassword")
 *
 * Pre-computed defaults (change in production!):
 *   admin / admin123   → ADMIN
 *   viewer / viewer123 → VIEWER
 */
@Component
@ConfigurationProperties(prefix = "app")
public class UserStore {

    private List<AppUser> users = List.of();

    public void setUsers(List<AppUser> users) {
        this.users = users;
    }

    public AppUser findByUsername(String username) {
        return users.stream()
                .filter(u -> u.username().equalsIgnoreCase(username))
                .findFirst()
                .orElse(null);
    }

    public record AppUser(
            String username,
            String hashedPassword,
            String orgId,
            List<String> roles
    ) {}
}
