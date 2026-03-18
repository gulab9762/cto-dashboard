package com.dashboard.integration.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Security configuration for the Integration Service.
 *
 * <p>Authentication model: <strong>API Key</strong> delivered via the
 * {@code X-API-Key} request header.  Chosen because webhook callers
 * (GitHub, Jira) are server-to-server systems that cannot participate in
 * interactive OAuth2 flows.</p>
 *
 * <p>Key decisions:</p>
 * <ul>
 *   <li>Stateless sessions – no HTTP session is ever created.</li>
 *   <li>CSRF disabled – all callers are machine clients sending JSON bodies.</li>
 *   <li>{@code /actuator/**} is permitted without credentials for health checks.</li>
 *   <li>All other paths require the WEBHOOK_SENDER role (set by {@link ApiKeyAuthFilter}).</li>
 * </ul>
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final ApiKeyAuthFilter apiKeyAuthFilter;

    public SecurityConfig(ApiKeyAuthFilter apiKeyAuthFilter) {
        this.apiKeyAuthFilter = apiKeyAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                // Webhooks are server-to-server → no session needed
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Machine clients don't need CSRF protection
                .csrf(AbstractHttpConfigurer::disable)
                
                .authorizeHttpRequests(auth -> auth
                        // Health / readiness probes are public
                        .requestMatchers("/actuator/**").permitAll()
                        // Every webhook endpoint requires a valid API key (resolved by the filter)
                        .anyRequest().hasRole("WEBHOOK_SENDER")
                )
                // Inject our API key filter before the default username/password filter
                .addFilterBefore(apiKeyAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
