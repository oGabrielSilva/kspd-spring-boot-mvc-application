package dev.kassiopeia.blog.authentication.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequestMapping("/session")
public class SessionController {
    @GetMapping
    public String page(Model model) {
        model.addAttribute("title", "Faça seu login");
        return "session";
    }

}
