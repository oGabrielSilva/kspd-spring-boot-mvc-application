package dev.kassiopeia.blog.modules.user.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import dev.kassiopeia.blog.exceptions.Forbidden;
import dev.kassiopeia.blog.modules.user.entities.User;
import dev.kassiopeia.blog.modules.user.repositories.UserRepository;

@Service
public class UserService implements UserDetailsService {
    @Autowired
    UserRepository repository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return repository.findByUsername(username);
    }

    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getPrincipal() instanceof User ? (User) authentication.getPrincipal() : null;
    }

    public User getCurrentAuthenticatedUserOrThrowsForbidden() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication.getPrincipal() instanceof User))
            throw new Forbidden();
        return (User) authentication.getPrincipal();
    }

    public void userIsAuthenticatedOrElseThrowsForbidden() {
        if (!(SecurityContextHolder.getContext().getAuthentication().getPrincipal() instanceof User))
            throw new Forbidden();
    }

    public boolean isAuthenticatedByUserEntity() {
        return getCurrentAuthenticatedUser() != null;
    }

}
