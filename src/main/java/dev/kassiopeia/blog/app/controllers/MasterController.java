package dev.kassiopeia.blog.app.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.ModelAndView;

import dev.kassiopeia.blog.data.constants.AppConstants;

@Controller
public class MasterController {
    @GetMapping("/gabriel-henrique-da-silva")
    public ModelAndView masterView(ModelAndView mv) {
        mv.setViewName("master");
        mv.addObject(AppConstants.PAGE_TITLE, "Gabriel Henrique da Silva");
        return mv;
    }
}
