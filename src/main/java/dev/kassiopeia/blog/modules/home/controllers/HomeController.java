package dev.kassiopeia.blog.modules.home.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.ModelAndView;

import dev.kassiopeia.blog.data.constants.AppConstants;

@Controller
public class HomeController {
    @GetMapping
    public ModelAndView index(ModelAndView mv) {
        mv.setViewName("index");
        mv.addObject(AppConstants.PAGE_TITLE, "Página inicial. Explore");
        return mv;
    }
}
