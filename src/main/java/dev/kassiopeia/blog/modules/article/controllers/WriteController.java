package dev.kassiopeia.blog.modules.article.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.ModelAndView;

import dev.kassiopeia.blog.modules.user.services.UserService;

@Controller
public class WriteController {
    @Autowired
    UserService userService;

    @GetMapping("/write")
    public ModelAndView write(ModelAndView mv) {
        var user = userService.getCurrentAuthenticatedUser();
        mv.setViewName(user == null ? "redirect:/session?next=/write" : "write");
        return mv;
    }

}
