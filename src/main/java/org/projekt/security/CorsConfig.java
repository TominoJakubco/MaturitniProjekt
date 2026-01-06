package org.projekt.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Povolené originy (frontend)
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));

        // Povolené HTTP metody
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Povolené headery
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Povolit credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);

        // Maximální čas cache pro preflight requesty
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}