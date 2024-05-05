package dev.kassiopeia.blog.mail.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import dev.kassiopeia.blog.exceptions.Conflict;
import dev.kassiopeia.blog.exceptions.InternalServerError;
import dev.kassiopeia.blog.mail.res.EmailTemplates;
import dev.kassiopeia.blog.mail.services.MailService;
import dev.kassiopeia.blog.modules.user.entities.Email;
import dev.kassiopeia.blog.modules.user.repositories.EmailRepository;
import dev.kassiopeia.blog.modules.user.services.UserService;
import dev.kassiopeia.blog.utilities.IdUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;

@RestController
@RequestMapping("/api/mail")
public class MailRestController {
    @Autowired
    UserService userService;
    @Autowired
    MailService mailService;
    @Autowired
    EmailRepository emailRepository;

    @PostMapping("/account/verification")
    @ResponseStatus(code = HttpStatus.CREATED)
    public void account() {
        var user = userService.getCurrentAuthenticatedUserOrThrowsForbidden();
        if (user.isEmailChecked())
            throw new Conflict("Usuário já possui seu email verificado");
        try {
            var emailByUser = emailRepository.findAllByUserId(user.getId());
            if (emailByUser != null && !emailByUser.isEmpty()) {
                emailByUser.forEach(em -> emailRepository.delete(em));
            }
            var verification = IdUtils.generate(5);
            emailRepository.save(new Email(verification, user.getId()));
            mailService.sendEmail(user.getEmail(), "Verificação da Conta - Kassiopeia",
                    EmailTemplates.generateVerificationContent(user, verification));
        } catch (Exception e) {
            e.printStackTrace();
            throw new InternalServerError("Erro ao enviar email");
        }
    }

}
