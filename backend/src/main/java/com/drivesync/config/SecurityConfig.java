package com.drivesync.config;

import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import com.drivesync.model.AppUser;
import com.drivesync.repository.UserRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;
import java.util.List;

@Configuration
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean UserDetailsService userDetailsService(UserRepository users) {
        return username -> {
            AppUser account = users.findByEmailIgnoreCase(username)
                .orElseThrow(() -> new UsernameNotFoundException("Account not found"));
            return User.withUsername(account.getEmail())
                .password(account.getPassword())
                .roles(account.getRole().name())
                .build();
        };
    }

    @Bean DaoAuthenticationProvider authenticationProvider(UserDetailsService userDetailsService, PasswordEncoder encoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(encoder);
        return provider;
    }

    @Bean SecurityFilterChain filterChain(HttpSecurity http, DaoAuthenticationProvider authenticationProvider) throws Exception {
        http.authenticationProvider(authenticationProvider);
        http.csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/health", "/error").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/applications/admin-list", "/api/applications/drive/*/eligible").hasRole("ADMIN")
                .requestMatchers("/api/drives/*/applicants", "/api/drives/*/export", "/api/drives/*/rounds", "/api/drives/*/notifications", "/api/drives/*/notifications/test", "/api/rounds/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/drives").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/drives/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/drives/**").hasRole("ADMIN")
                .requestMatchers("/api/students/**").hasRole("ADMIN")
                .requestMatchers("/api/analytics/**").hasRole("ADMIN")
                .requestMatchers("/api/applications/*/status").hasRole("ADMIN")
                .requestMatchers("/api/drives/eligible", "/api/applications/me", "/api/applications").hasRole("STUDENT")
                .anyRequest().authenticated())
            .httpBasic(Customizer.withDefaults());
        return http.build();
    }

    @Bean CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(System.getenv().getOrDefault("FRONTEND_ORIGIN","http://localhost:5173")));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization","Content-Type","Accept"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
