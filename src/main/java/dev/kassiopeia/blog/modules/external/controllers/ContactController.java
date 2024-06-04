package dev.kassiopeia.blog.modules.external.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class ContactController {

    @GetMapping("/contact")
    public ModelAndView contactView(ModelAndView mv) {
        mv.setViewName("contact");
        mv.addObject("isReport", false);
        return mv;
    }

    @GetMapping("/report")
    public ModelAndView reportView(ModelAndView mv) {
        mv.setViewName("contact");
        mv.addObject("isReport", true);
        return mv;
    }
}
