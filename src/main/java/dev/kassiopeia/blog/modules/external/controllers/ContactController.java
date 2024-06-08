package dev.kassiopeia.blog.modules.external.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.ModelAndView;

import dev.kassiopeia.blog.data.constants.AppConstants;

@Controller
public class ContactController {

    @GetMapping("/contact")
    public ModelAndView contactView(ModelAndView mv) {
        mv.setViewName("contact");
        mv.addObject("isReport", false);
        mv.addObject(AppConstants.PAGE_TITLE, "Entre em contato com nossa equipe");
        return mv;
    }

    @GetMapping("/report")
    public ModelAndView reportView(ModelAndView mv) {
        mv.setViewName("contact");
        mv.addObject("isReport", true);
        mv.addObject(AppConstants.PAGE_TITLE, "Encontrou um problema?");
        return mv;
    }
}
