package dev.kassiopeia.blog.modules.user.controllers;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import dev.kassiopeia.blog.authentication.services.TokenService;
import dev.kassiopeia.blog.authentication.validation.AuthenticationValidation;
import dev.kassiopeia.blog.exceptions.BadRequest;
import dev.kassiopeia.blog.exceptions.Conflict;
import dev.kassiopeia.blog.exceptions.InternalServerError;
import dev.kassiopeia.blog.exceptions.NotFound;
import dev.kassiopeia.blog.exceptions.ServiceUnavailable;
import dev.kassiopeia.blog.exceptions.Unauthorized;
import dev.kassiopeia.blog.modules.aws.services.AmazonS3Service;
import dev.kassiopeia.blog.modules.user.DTOs.AccountValidationDTO;
import dev.kassiopeia.blog.modules.user.DTOs.UserDTO;
import dev.kassiopeia.blog.modules.user.DTOs.UserUpdateDTO;
import dev.kassiopeia.blog.modules.user.DTOs.UserUpdatePasswordDTO;
import dev.kassiopeia.blog.modules.user.entities.SocialMedia;
import dev.kassiopeia.blog.modules.user.entities.User;
import dev.kassiopeia.blog.modules.user.repositories.EmailRepository;
import dev.kassiopeia.blog.modules.user.repositories.UserRepository;
import dev.kassiopeia.blog.modules.user.services.UserService;
import dev.kassiopeia.blog.utilities.StringUtils;
import jakarta.servlet.http.HttpServletResponse;
import com.amazonaws.services.s3.model.ObjectMetadata;
import org.springframework.web.bind.annotation.GetMapping;

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
    @Autowired
    AmazonS3Service s3Service;
    @Autowired
    EmailRepository emailRepository;
    // @Autowired
    // ApplicationBecomeAuthorRepository applicationBecomeAuthorRepository;

    @GetMapping("/{user}")
    public UserDTO findUser(@PathVariable("user") String user) {
        if (StringUtils.isNullOrBlank(user))
            throw new BadRequest("Informe qual usuário está buscando");
        var search = user.contains("@") ? userRepository.findByEmail(user) : userRepository.findByUsername(user);
        if (search == null)
            throw new NotFound(String.format("Usuário %s não encontrado", user));
        return search.toDataTransferObject();
    }

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
        if (StringUtils.isNotNullOrBlank(payload.getX())
                && StringUtils.isNotEquals(payload.getX(), user.getSocial().getX())) {
            var x = payload.getX().toLowerCase().trim();
            if (!x.contains("twitter.com/") && !x.contains("x.com/"))
                throw new BadRequest("Link do Twitter/X é inválido");
            user.getSocial().setX(x);
            changed = true;
        }
        if (StringUtils.isNotNullOrBlank(payload.getGithub())
                && StringUtils.isNotEquals(payload.getGithub(), user.getSocial().getGithub())) {
            var github = payload.getGithub().toLowerCase().trim();
            if (!github.contains("github.com/"))
                throw new BadRequest("Link do Github é inválido");
            user.getSocial().setGithub(github);
            changed = true;
        }
        if (StringUtils.isNotNullOrBlank(payload.getInstagram())
                && StringUtils.isNotEquals(payload.getInstagram(), user.getSocial().getInstagram())) {
            var instagram = payload.getInstagram().toLowerCase().trim();
            if (!instagram.contains("instagram.com/"))
                throw new BadRequest("Link do Instagram é inválido");
            user.getSocial().setInstagram(instagram);
            changed = true;
        }
        if (StringUtils.isNotNullOrBlank(payload.getLinkedin())
                && StringUtils.isNotEquals(payload.getLinkedin(), user.getSocial().getLinkedin())) {
            var linkedin = payload.getLinkedin().toLowerCase().trim();
            if (!linkedin.contains("linkedin.com/in/"))
                throw new BadRequest("Link do LinkedIn é inválido");
            user.getSocial().setLinkedin(linkedin);
            changed = true;
        }
        if (StringUtils.isNotNullOrBlank(payload.getSite())
                && StringUtils.isNotEquals(payload.getSite(), user.getSocial().getSite())) {
            var site = payload.getSite().toLowerCase().trim();
            if (!site.contains("https://"))
                throw new BadRequest("Link do site é inválido. Causa: não começa com https://");
            user.getSocial().setSite(site);
            changed = true;
        }
        if (StringUtils.isNotNullOrBlank(payload.getReddit())
                && StringUtils.isNotEquals(payload.getReddit(), user.getSocial().getReddit())) {
            var reddit = payload.getReddit().toLowerCase().trim();
            if (!reddit.contains("reddit.com/user/") && !reddit.contains("reddit.com/r/"))
                throw new BadRequest("Link do Reddit é inválido");
            user.getSocial().setReddit(reddit);
            changed = true;
        }
        if (StringUtils.isNotNullOrBlank(payload.getYoutube())
                && StringUtils.isNotEquals(payload.getYoutube(), user.getSocial().getYoutube())) {
            var youtube = payload.getYoutube().toLowerCase().trim();
            if (!youtube.contains("youtube.com/"))
                throw new BadRequest("Link do Youtube é inválido");
            user.getSocial().setYoutube(youtube);
            changed = true;
        }

        if (!changed)
            throw new BadRequest("Requisição possui corpo inválido ou vazio");

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

    @GetMapping("/avatar/{username}")
    public ResponseEntity<Resource> getAvatar(@PathVariable("username") String username) {
        if (StringUtils.isNullOrBlank(username))
            throw new BadRequest("URL inválida");
        var user = userRepository.findByUsername(username);
        if (user == null)
            throw new NotFound("Usuário não existe");
        var avatar = s3Service.getObject("avatar/" + user.getId());
        if (avatar == null)
            throw new NotFound("Avatar não encontrado");

        Resource resource;
        try {
            resource = new ByteArrayResource(avatar.getObjectContent().readAllBytes());
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(avatar.getObjectMetadata().getContentType()))
                    .contentLength(avatar.getObjectMetadata().getContentLength())
                    .body(resource);
        } catch (IOException e) {
            throw new InternalServerError("Erro ao ler a imagem");
        }

    }

    @PatchMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE }, path = "/avatar")
    public Map<String, String> avatarUpdate(@RequestParam("avatar") MultipartFile avatar) {
        if (avatar == null || avatar.isEmpty() || avatar.getContentType() == null)
            throw new BadRequest("Avatar inválido");
        var contentType = avatar.getContentType();
        if (!(contentType.equals("image/jpeg") || contentType.equals("image/webp")))
            throw new BadRequest(
                    "Erro de conteúdo. O cliente não processou a imagem para os formatos aceitos [jpeg, webp]");
        var user = userService.getCurrentAuthenticatedUserOrThrowsForbidden();
        var metadata = new ObjectMetadata();
        metadata.addUserMetadata("id", user.getId());
        metadata.addUserMetadata("time", String.valueOf(System.currentTimeMillis()));
        var result = s3Service.uploadMultipart(avatar,
                "avatar/" + user.getId(), metadata);
        if (!result.success())
            throw new InternalServerError("Não foi possível salvar a imagem");
        user.setPrivateAvatarURL(result.url());
        user.setAvatarURL("/api/user/avatar/" + user.getUsername() + "?version=" + System.currentTimeMillis());
        userRepository.save(user);
        return Map.of("url", user.getAvatarURL());
    }

    @PostMapping("/email-validation")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void emailValidation(@RequestBody AccountValidationDTO payload) {
        if (payload == null)
            throw new BadRequest("Requisição inválida");
        if (StringUtils.isNullOrBlank(payload.validation()))
            throw new BadRequest("Código de uso único não informado");
        if (payload.validation().length() != 5)
            throw new BadRequest("Código de uso único não é válido");
        var validation = emailRepository.findByCode(payload.validation());
        if (validation == null)
            throw new NotFound("Código de uso único não é válido");
        var user = userService.getCurrentAuthenticatedUserOrThrowsForbidden();
        if (user.isEmailChecked())
            throw new Conflict("Usuário já possui seu email verificado");
        if (StringUtils.isNotEquals(validation.getUserId(), user.getId()))
            throw new Unauthorized("Operação não permitida");
        user.setEmailChecked(true);
        userRepository.save(user);
    }

    @PatchMapping("/become-author")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public Map<String, String> becomeAuthor() {
        throw new ServiceUnavailable("Lamentamos informar que este serviço encontra-se temporariamente indisponível");
        // var user = userService.getCurrentAuthenticatedUserOrThrowsForbidden();
        // if (user.isNonAuthor()) {
        // var aba = new ApplicationBecomeAuthor();
        // applicationBecomeAuthorRepository.save(aba);
        // return Map.of("message",
        // "Recebemos seu pedido para se tornar um autor e ele se encontra pendente no
        // momento.");
        // }
        // throw new Conflict("Obtivemos um conflito na sua requisição. Talvez você já
        // seja um autor");
    }
}
