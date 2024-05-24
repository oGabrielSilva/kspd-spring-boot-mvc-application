package dev.kassiopeia.blog.modules.articles.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import dev.kassiopeia.blog.modules.user.services.UserService;

@Controller
public class WriteController {
    @Autowired
    UserService userService;

    @GetMapping("/write")
    public String write() {
        var user = userService.getCurrentAuthenticatedUser();
        if (user == null)
            return "redirect:/session?next=/write";
        return "write";
    }

}
