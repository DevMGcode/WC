package com.mundial2026.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    /**
     * Orígenes dev (localhost, túneles ngrok). Solo se habilitan cuando
     * app.security.cors.allow-dev-origins=true (default true en dev).
     * En producción ponlo en "false" para que SOLO se permita el dominio real.
     */
    @Value("${app.security.cors.allow-dev-origins:true}")
    private boolean allowDevOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .headers(headers -> headers
                .contentTypeOptions(Customizer.withDefaults())
                .frameOptions(fo -> fo.sameOrigin())
                .httpStrictTransportSecurity(hsts -> hsts
                    .maxAgeInSeconds(31536000)
                    .includeSubDomains(true))
            )
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // ─────────────────────────────────────────────────────────────
                // REGLAS RESTRICTIVAS PRIMERO. Spring Security evalúa en orden
                // y la primera coincidencia gana, así que las restricciones
                // específicas deben preceder al permitAll genérico para que
                // no se "tragen" peticiones mutativas a rutas /public/**.
                // ─────────────────────────────────────────────────────────────

                // Operaciones mutativas sobre fixtures bajo /public/tournaments/**:
                // pese al prefijo "public", crear/editar/borrar partidos y editar
                // marcadores son acciones administrativas y deben requerir ADMIN.
                .requestMatchers(HttpMethod.POST,   "/api/v1/public/tournaments/fixtures",
                                                   "/api/v1/public/tournaments/fixtures/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/v1/public/tournaments/fixtures/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH,  "/api/v1/public/tournaments/fixtures/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/public/tournaments/fixtures/**").hasRole("ADMIN")

                // Endpoints administrativos clásicos: requieren rol ADMIN
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

                // Admin operations bajo /public/admin/** (config, eventos manuales)
                .requestMatchers("/api/v1/public/admin/**").hasRole("ADMIN")

                // Signup: POST /api/v1/users (sin auth, creación de cuenta)
                .requestMatchers(HttpMethod.POST, "/api/v1/users").permitAll()

                // Stats Premium-only que viven bajo /public por simetría con el resto del módulo
                // tournament — pero requieren JWT + suscripción Premium (validado en controller).
                .requestMatchers(HttpMethod.GET,
                        "/api/v1/public/players/topassists",
                        "/api/v1/public/fixtures/*/statistics",
                        "/api/v1/public/fixtures/*/players",
                        "/api/v1/public/fixtures/headtohead"
                ).authenticated()

                // ─────────────────────────────────────────────────────────────
                // PERMIT ALL para GETs públicos. Ya filtramos arriba las
                // mutaciones, así que estos matchers solo aplican a GET (y al
                // resto de métodos no listados, que el controller no expone).
                // ─────────────────────────────────────────────────────────────
                .requestMatchers(
                    "/actuator/health",
                    "/actuator/info",
                    "/swagger-ui.html",
                    "/swagger-ui/**",
                    "/api-docs/**",
                    "/ws/**",

                    // Auth endpoints (login, registro, recuperación, verificación)
                    "/api/v1/auth/**",

                    // Endpoints REALMENTE públicos del torneo (no exponen datos privados):
                    "/api/v1/public/health",
                    "/api/v1/public/tournaments",
                    "/api/v1/public/tournaments/**",
                    "/api/v1/public/players/**",
                    "/api/v1/public/fixtures/**",
                    "/api/v1/public/teams",
                    "/api/v1/public/teams/**",
                    "/api/v1/public/standings/**",

                    // Sub-endpoints públicos dentro de rutas privadas (counts globales):
                    "/api/v1/predictions/count",
                    "/api/v1/users/count",

                    // Webhooks de proveedores de pago (validados por firma HMAC, no por JWT)
                    "/api/v1/public/payments/**"
                ).permitAll()
                // El resto (predictions, leagues, scores, rankings/user, users/{id}, etc.)
                // requiere autenticación; los controllers validan ownership con SecurityUtils.
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> patterns = new ArrayList<>();

        // Orígenes de desarrollo (localhost + túneles ngrok). Con allowCredentials(true)
        // un wildcard ngrok permitiría a cualquier subdominio *.ngrok hacer peticiones
        // con credenciales — aceptable en dev, peligroso en producción. Por eso van
        // detrás del flag y NO se incluyen cuando allow-dev-origins=false.
        if (allowDevOrigins) {
            patterns.add("http://localhost:3000");
            patterns.add("http://127.0.0.1:3000");
            patterns.add("https://*.ngrok-free.dev");
            patterns.add("https://*.ngrok-free.app");
            patterns.add("https://*.ngrok.io");
        }

        // El dominio real de producción siempre se permite (con y sin www).
        if (frontendUrl != null && !frontendUrl.contains("localhost")) {
            patterns.add(frontendUrl);
            // Agrega la variante sin/con www para evitar CORS cuando el usuario
            // llega por el dominio alternativo.
            if (frontendUrl.contains("://www.")) {
                patterns.add(frontendUrl.replace("://www.", "://"));
            } else {
                patterns.add(frontendUrl.replace("://", "://www."));
            }
        }
        configuration.setAllowedOriginPatterns(patterns);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
