package dev.kassiopeia.blog.authentication.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import dev.kassiopeia.blog.authentication.services.TokenService;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequestMapping("/session")
public class SessionController {
    @Autowired
    TokenService tokenService;

    @GetMapping
    public String page(Model model) {
        model.addAttribute("title", "Faça seu login");
        return "session";
    }

    @GetMapping("/sign-out")
    public String signOut(HttpServletResponse response) {
        response.addCookie(tokenService.createInvalidCookie());
        return "redirect:/";
    }

}
