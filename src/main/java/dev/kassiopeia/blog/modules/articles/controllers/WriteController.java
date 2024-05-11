package dev.kassiopeia.blog.modules.articles.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.servlet.ModelAndView;

import dev.kassiopeia.blog.exceptions.NotFound;
import dev.kassiopeia.blog.modules.articles.entities.Article;
import dev.kassiopeia.blog.modules.articles.repositories.ArticleRepository;
import dev.kassiopeia.blog.modules.user.services.UserService;
import dev.kassiopeia.blog.utilities.StringUtils;

@Controller
public class WriteController {
    @Autowired
    UserService userService;
    @Autowired
    ArticleRepository articleRepository;

    @GetMapping("/write")
    public String write() {
        var user = userService.getCurrentAuthenticatedUser();
        if (user == null)
            return "redirect:/session?next=/write";
        return "write";
    }

    @GetMapping("/{slug}/edit")
    public ModelAndView edit(@PathVariable("slug") String slug) {
        if (StringUtils.isNullOrBlank(slug)) {
            throw new NotFound("");
        }

        Article art = articleRepository.findBySlug(slug);
        if (art == null) {
            throw new NotFound("");
        }

        var user = userService.getCurrentAuthenticatedUserOrThrowsForbidden();
        var isEditor = art.getEditors().stream().anyMatch(e -> e.id().equals(user.getId()));
        if (!isEditor) {
            return new ModelAndView("redirect:/" + slug);
        }
        var mv = new ModelAndView("article-edit");
        mv.addObject("article", art);
        return mv;
    }
}
