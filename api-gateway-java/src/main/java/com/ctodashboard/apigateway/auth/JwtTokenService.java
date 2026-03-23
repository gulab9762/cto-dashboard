package com.ctodashboard.apigateway.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * Issues and validates self-signed HMAC-SHA256 JWTs.
 * No external IdP required — the gateway is both issuer and validator.
 *
 * Secret is read from {@code JWT_SECRET} env var (min 32 chars recommended).
 */
@Service
public class JwtTokenService {

    private static final long EXPIRY_MS = 8 * 60 * 60 * 1000L; // 8 hours

    private final SecretKey signingKey;

    public JwtTokenService(
            @Value("${jwt.secret:${JWT_SECRET:cto-dashboard-local-dev-secret-change-in-prod}}") String secret) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /** Build a signed JWT containing the user's identity claims. */
    public String generateToken(String username, String orgId, List<String> roles) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRY_MS))
                .claims(Map.of(
                        "org_id", orgId,
                        "roles",  roles,
                        "email",  username + "@ctodashboard.local"
                ))
                .signWith(signingKey)
                .compact();
    }

    /**
     * Parse and validate a JWT. Returns its claims on success.
     * Throws {@link JwtException} if the token is invalid or expired.
     */
    public Claims validateToken(String token) {
        validateStructure(token);

        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }


    /** Convenience: extract the subject (username) from a token. */
    public String getUsername(String token) {
        return validateToken(token).getSubject();
    }

    private void validateStructure(String token) {
        String[] parts = token.split("\\.", -1);
        if (parts.length != 3) {
            throw new JwtException("Invalid JWT structural format");
        }
        for (String part : parts) {
            if (part.length() % 4 == 1) {
                throw new JwtException("Malformed Base64URL string length modulus 4 is 1");
            }
        }
    }
}
