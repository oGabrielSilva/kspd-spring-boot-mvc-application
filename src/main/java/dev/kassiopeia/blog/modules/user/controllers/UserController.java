package dev.kassiopeia.blog.modules.user.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import dev.kassiopeia.blog.modules.user.repositories.UserRepository;
import dev.kassiopeia.blog.modules.user.services.UserService;

@Controller
@RequestMapping("/u")
public class UserController {

    @Autowired
    UserRepository userRepository;
    @Autowired
    UserService userService;

    @GetMapping("/{username}")
    public ModelAndView profile(@PathVariable String username, ModelAndView mv) {
        var authenticatedUser = userService.getCurrentAuthenticatedUser();
        if (authenticatedUser != null && authenticatedUser.getUsername().equals(username)) {
            mv.setViewName("profile-edit");
            return mv;
        }
        var profile = userRepository.findByUsername(username);
        if (profile == null) {
            mv.setViewName("404");
            return mv;
        }
        mv.setViewName("profile-user");
        mv.addObject("profile", profile);
        return mv;
    }

}
