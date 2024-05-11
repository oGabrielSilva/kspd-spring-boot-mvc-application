package dev.kassiopeia.blog.authentication.configurations;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import dev.kassiopeia.blog.authentication.enums.AuthenticationRole;
import dev.kassiopeia.blog.authentication.filters.DefaultSecurityFilter;
import dev.kassiopeia.blog.modules.user.interceptors.AddUserToModelViewInterceptor;

@Configuration
@EnableWebSecurity
public class DefaultWebSecurityConfig implements WebMvcConfigurer {
    @Autowired
    DefaultSecurityFilter securityFilter;
    @Autowired
    AddUserToModelViewInterceptor addUserToModelViewInterceptor;

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http.csrf(csrf -> csrf.disable())
                .sessionManagement(manager -> manager.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(
                        request -> request.requestMatchers("/api/session", "/api/session/sign-up")
                                .permitAll()
                                .requestMatchers("/api/user/avatar/**").permitAll()
                                .requestMatchers("/api/**").hasRole(AuthenticationRole.COMMON.asString())
                                .requestMatchers("/api/article", "/api/article/**")
                                .hasRole(AuthenticationRole.AUTHOR.asString())
                                .requestMatchers("/root/**")
                                .hasAnyRole(AuthenticationRole.ADMIN.asString(), AuthenticationRole.ROOT.asString())
                                .anyRequest().permitAll())
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(addUserToModelViewInterceptor).excludePathPatterns("/api/**", "/public/**", "/session",
                "/forgot-password", "/error").addPathPatterns("/", "/**");
    }

}
