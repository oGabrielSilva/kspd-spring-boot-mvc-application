package dev.kassiopeia.blog.modules.external.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.ModelAndView;

import dev.kassiopeia.blog.data.constants.AppConstants;

@Controller
public class CookiesController {

    @GetMapping("/cookies")
    public ModelAndView cookiesView(ModelAndView mv) {
        mv.setViewName("cookies");
        mv.addObject(AppConstants.PAGE_TITLE, "Entenda os cookies");
        return mv;
    }

}
