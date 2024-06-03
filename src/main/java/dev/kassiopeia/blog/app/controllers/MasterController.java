package dev.kassiopeia.blog.app.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MasterController {
    @GetMapping("/gabriel-henrique-da-silva")
    public String masterView() {
        return "master";
    }
}
