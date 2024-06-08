package dev.kassiopeia.blog.modules.external.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.ModelAndView;

import dev.kassiopeia.blog.data.constants.AppConstants;

@Controller
public class TermsController {
    @GetMapping("/terms")
    public ModelAndView terms(ModelAndView mv) {
        mv.setViewName("terms");
        mv.addObject(AppConstants.PAGE_TITLE, "Nossos Termos de Uso");
        return mv;
    }

}
