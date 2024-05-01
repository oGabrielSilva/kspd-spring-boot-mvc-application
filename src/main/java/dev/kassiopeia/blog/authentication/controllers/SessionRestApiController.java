package dev.kassiopeia.blog.authentication.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dev.kassiopeia.blog.authentication.DTOs.SessionRequestDTO;
import dev.kassiopeia.blog.authentication.DTOs.SessionResponseDTO;
import dev.kassiopeia.blog.authentication.services.TokenService;
import dev.kassiopeia.blog.authentication.validation.AuthenticationValidation;
import dev.kassiopeia.blog.exceptions.BadRequest;
import dev.kassiopeia.blog.exceptions.Conflict;
import dev.kassiopeia.blog.exceptions.NotFound;
import dev.kassiopeia.blog.exceptions.Unauthorized;
import dev.kassiopeia.blog.modules.user.entities.User;
import dev.kassiopeia.blog.modules.user.repositories.UserRepository;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/session")
public class SessionRestApiController {

    @Autowired
    AuthenticationValidation validation;
    @Autowired
    PasswordEncoder passwordEncoder;
    @Autowired
    UserRepository userRepository;
    @Autowired
    TokenService tokenService;

    @PostMapping
    public SessionResponseDTO session(@RequestBody SessionRequestDTO payload, HttpServletResponse response) {
        if (payload == null)
            throw new BadRequest("Não foi possível processar o payload");
        if (!validation.isEmailValid(payload.email()))
            throw new BadRequest("O sistema não recebeu um email considerado válido");
        if (!validation.isPasswordValid(payload.password()))
            throw new BadRequest("O sistema não recebeu uma senha considerada válida");
        var userByEmail = userRepository.findByEmail(payload.email());
        if (userByEmail == null)
            throw new NotFound("Não encontramos o usuário. Tente fazer o cadastro");
        if (!passwordEncoder.matches(payload.password(), userByEmail.getPassword()))
            throw new Unauthorized("Credenciais inválidas");
        var token = tokenService.create(userByEmail);
        if (payload.cookie() != null && payload.cookie()) {
            response.addCookie(tokenService.createCookie(token));
        }
        return new SessionResponseDTO(token, userByEmail.toDataTransferObject());
    }

    @PostMapping("/sign-up")
    public SessionResponseDTO signUp(@RequestBody SessionRequestDTO payload, HttpServletResponse response) {
        if (payload == null)
            throw new BadRequest("Não foi possível processar o payload");
        if (!validation.isEmailValid(payload.email()))
            throw new BadRequest("O sistema não recebeu um email considerado válido");
        if (!validation.isPasswordValid(payload.password()))
            throw new BadRequest("O sistema não recebeu uma senha considerada válida");
        var userByEmail = userRepository.findByEmail(payload.email());
        if (userByEmail != null)
            throw new Conflict("Email já está cadastrado");
        var user = userRepository.save(new User(payload.email(), passwordEncoder.encode(payload.password())));
        var token = tokenService.create(user);
        if (payload.cookie() != null && payload.cookie()) {
            response.addCookie(tokenService.createCookie(token));
        }
        return new SessionResponseDTO(token, user.toDataTransferObject());
    }
}
