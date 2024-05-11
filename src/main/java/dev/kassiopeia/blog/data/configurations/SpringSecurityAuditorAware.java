package dev.kassiopeia.blog.data.configurations;

import java.util.Optional;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import dev.kassiopeia.blog.modules.user.DTOs.UserInternalDTO;
import dev.kassiopeia.blog.modules.user.entities.User;

@Configuration
class SpringSecurityAuditorAware implements AuditorAware<UserInternalDTO> {

    @Override
    public Optional<UserInternalDTO> getCurrentAuditor() {

        return Optional.ofNullable(SecurityContextHolder.getContext())
                .map(SecurityContext::getAuthentication)
                .filter(Authentication::isAuthenticated)
                .map(Authentication::getPrincipal)
                .map(principal -> {
                    if (!(principal instanceof User))
                        return null;
                    User user = (User) principal;
                    return new UserInternalDTO(
                            user.getId(),
                            user.getEmail(),
                            user.getName(),
                            user.getUsername(),
                            user.getRole(),
                            user.isEmailChecked(),
                            user.getVersion());
                });
    }
}
