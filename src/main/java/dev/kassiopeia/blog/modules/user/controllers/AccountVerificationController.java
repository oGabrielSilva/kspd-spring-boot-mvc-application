package dev.kassiopeia.blog.modules.user.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import dev.kassiopeia.blog.modules.mail.res.EmailTemplates;
import dev.kassiopeia.blog.modules.mail.services.MailService;
import dev.kassiopeia.blog.modules.user.entities.Email;
import dev.kassiopeia.blog.modules.user.repositories.EmailRepository;
import dev.kassiopeia.blog.modules.user.services.UserService;
import dev.kassiopeia.blog.utilities.IdUtils;

@Controller
public class AccountVerificationController {
    @Autowired
    UserService userService;
    @Autowired
    MailService mailService;
    @Autowired
    EmailRepository emailRepository;

    @GetMapping("/account-verification")
    public String accountVerification() {
        var user = userService.getCurrentAuthenticatedUser();
        if (user == null)
            return "redirect:/session";
        if (user.isEmailChecked()) {
            return "redirect:/";
        }
        try {
            var emailByUser = emailRepository.findAllByUserId(user.getId());
            if (emailByUser != null && !emailByUser.isEmpty()) {
                emailByUser.forEach(em -> emailRepository.delete(em));
            }
            var verification = IdUtils.generate(5);
            emailRepository.save(new Email(verification, user.getId()));
            mailService.sendEmail(user.getEmail(), "Verificação da Conta - Kassiopeia",
                    EmailTemplates.generateVerificationContent(user, verification));
            return "account-verification";
        } catch (Exception e) {
            e.printStackTrace();
            return "500";
        }
    }
}
