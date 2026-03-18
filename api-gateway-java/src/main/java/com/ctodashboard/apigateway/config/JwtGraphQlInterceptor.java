package com.ctodashboard.apigateway.config;

import io.jsonwebtoken.Claims;
import org.springframework.graphql.server.WebGraphQlInterceptor;
import org.springframework.graphql.server.WebGraphQlRequest;
import org.springframework.graphql.server.WebGraphQlResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Injects authenticated user identity into every GraphQL execution context.
 *
 * JWT claims are stored on the SecurityContext principal by {@link com.ctodashboard.apigateway.auth.JwtAuthFilter}.
 * Resolvers can read them via:
 *   {@code env.getGraphQlContext().get("userId")}
 *   {@code env.getGraphQlContext().get("orgId")}
 *   {@code env.getGraphQlContext().get("roles")}
 */
@Component
public class JwtGraphQlInterceptor implements WebGraphQlInterceptor {

    @Override
    @NonNull
    public Mono<WebGraphQlResponse> intercept(@NonNull WebGraphQlRequest request, @NonNull Chain chain) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.isAuthenticated() && auth.getCredentials() instanceof Claims claims) {
            @SuppressWarnings("unchecked")
            List<String> roles = claims.get("roles", List.class);

            request.configureExecutionInput((input, builder) ->
                    builder.graphQLContext(ctx -> {
                        ctx.put("userId", claims.getSubject());
                        ctx.put("orgId",  claims.getOrDefault("org_id", ""));
                        ctx.put("email",  claims.getOrDefault("email", ""));
                        ctx.put("roles",  roles != null ? roles : List.of());
                    }).build()
            );
        }

        return chain.next(request);
    }
}
