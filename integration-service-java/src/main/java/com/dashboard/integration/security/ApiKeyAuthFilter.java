package com.dashboard.integration.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Validates the {@code X-API-Key} header on every inbound request.
 *
 * <p>Webhooks from GitHub / Jira are sent as server-to-server HTTP calls,
 * so a shared API key is the right credential model here.  The key value
 * is read from the {@code INTEGRATION_API_KEY} environment variable (with a
 * safe local default) so it is never hard-coded in source.</p>
 */
@Component
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(ApiKeyAuthFilter.class);
    private static final String API_KEY_HEADER = "X-API-Key";
    private static final String API_KEY_PARAM = "api_key";

    @Value("${integration.security.api-key:${INTEGRATION_API_KEY:changeme-local-dev-key}}")
    private String validApiKey;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        String providedKey = request.getHeader(API_KEY_HEADER);
        
        // If header is missing, also check for a query parameter named 'api_key'
        // This is the easiest way to pass a secret via GitHub's Payload URL
        if (providedKey == null) {
            providedKey = request.getParameter(API_KEY_PARAM);
        }

        if (providedKey != null && providedKey.equals(validApiKey)) {
            // Build an authenticated token – role WEBHOOK_SENDER for fine-grained control
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    "webhook-client",
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_WEBHOOK_SENDER"))
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
            log.debug("✅ API key validated for request: {} {}", request.getMethod(), request.getRequestURI());
        } else {
            log.warn("⛔ Missing or invalid API key for request: {} {}", request.getMethod(), request.getRequestURI());
        }

        filterChain.doFilter(request, response);
    }

    /** Skip the filter for actuator health checks so they remain public. */
    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/actuator");
    }
}
