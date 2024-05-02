package dev.kassiopeia.blog.modules.user.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import dev.kassiopeia.blog.authentication.services.TokenService;
import dev.kassiopeia.blog.authentication.validation.AuthenticationValidation;
import dev.kassiopeia.blog.exceptions.BadRequest;
import dev.kassiopeia.blog.exceptions.Conflict;
import dev.kassiopeia.blog.exceptions.Unauthorized;
import dev.kassiopeia.blog.modules.user.DTOs.UserUpdateDTO;
import dev.kassiopeia.blog.modules.user.DTOs.UserUpdatePasswordDTO;
import dev.kassiopeia.blog.modules.user.entities.SocialMedia;
import dev.kassiopeia.blog.modules.user.entities.User;
import dev.kassiopeia.blog.modules.user.repositories.UserRepository;
import dev.kassiopeia.blog.modules.user.services.UserService;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/user")
public class UserRestController {
    @Autowired
    AuthenticationValidation validation;
    @Autowired
    UserRepository userRepository;
    @Autowired
    UserService userService;
    @Autowired
    TokenService tokenService;
    @Autowired
    PasswordEncoder passwordEncoder;

    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    @PatchMapping
    public void partialUpdate(@RequestBody UserUpdateDTO payload, HttpServletResponse response) {
        User user = userService.getCurrentAuthenticatedUserOrThrowsForbidden();
        var changed = false;

        if (payload.email() != null && !payload.email().isBlank()) {
            if (!validation.isEmailValid(payload.email()))
                throw new BadRequest("Email informado não é válido");
            if (payload.password() == null || payload.password().isBlank()
                    || !validation.isPasswordValid(payload.password()))
                throw new BadRequest("Senha informada não é válida");
            if (!passwordEncoder.matches(payload.password(), user.getPassword()))
                throw new Unauthorized("Credenciais inválidas");
            var userByEmail = userRepository.findByEmail(payload.email());
            System.out.println("User by email: " + userByEmail);
            if (userByEmail != null)
                throw new Conflict("Email já está em uso por outra conta");
            user.setEmail(payload.email().trim());
            changed = true;
        }

        if (payload.name() != null && !payload.name().isBlank()) {
            if (!validation.isNameValid(payload.name()))
                throw new BadRequest("Nome é inválido");
            user.setName(payload.name().trim());
            changed = true;
        }

        if (payload.username() != null && !payload.username().isBlank()) {
            if (userRepository.findByUsername(payload.username()) != null)
                throw new Conflict("Username já está sendo usado por outro usuário");
            user.setUsername(payload.username().trim());
            changed = true;
        }

        if (payload.bio() != null && !payload.bio().isBlank() && !payload.bio().equals(user.getBio())) {
            user.setBio(payload.bio());
            user.setUsername(payload.username().trim());
            changed = true;
        }

        if (changed) {
            userRepository.save(user);
            var cookie = tokenService.createCookie(tokenService.create(user));
            response.addCookie(cookie);
            response.addHeader("Bearer__at__", cookie.getValue());
        } else
            throw new BadRequest("Requisição possui corpo inválido");
    }

    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    @PatchMapping("/social")
    public void socialUpdate(@RequestBody SocialMedia payload) {
        User user = userService.getCurrentAuthenticatedUserOrThrowsForbidden();
        boolean changed = false;

        if (payload.getX() != null && !payload.getX().equals(user.getSocial().getX())) {
            user.getSocial().setX(payload.getX());
            changed = true;
        }
        if (payload.getGithub() != null && !payload.getGithub().equals(user.getSocial().getGithub())) {
            user.getSocial().setGithub(payload.getGithub());
            changed = true;
        }
        if (payload.getInstagram() != null && !payload.getInstagram().equals(user.getSocial().getInstagram())) {
            user.getSocial().setInstagram(payload.getInstagram());
            changed = true;
        }
        if (payload.getLinkedin() != null && !payload.getLinkedin().equals(user.getSocial().getLinkedin())) {
            user.getSocial().setLinkedin(payload.getLinkedin());
            changed = true;
        }
        if (payload.getSite() != null && !payload.getSite().equals(user.getSocial().getSite())) {
            user.getSocial().setSite(payload.getSite());
            changed = true;
        }
        if (payload.getYoutube() != null && !payload.getYoutube().equals(user.getSocial().getYoutube())) {
            user.getSocial().setYoutube(payload.getYoutube());
            changed = true;
        }

        if (!changed)
            throw new BadRequest("Requisição possui corpo inválido");

        userRepository.save(user);

    }

    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    @PatchMapping("/password")
    public void passwordUpdate(@RequestBody UserUpdatePasswordDTO payload) {
        User user = userService.getCurrentAuthenticatedUserOrThrowsForbidden();
        if (!validation.isPasswordValid(payload.password())) {
            throw new BadRequest("Senha atual está inválida");
        }

        if (!validation.isPasswordValid(payload.newPassword())) {
            throw new BadRequest("A nova senha precisa ser válida");
        }

        if (!passwordEncoder.matches(payload.password(), user.getPassword())) {
            throw new Unauthorized("Credenciais inválidas");
        }

        user.setPassword(passwordEncoder.encode(payload.newPassword()));
        userRepository.save(user);
    }
}
