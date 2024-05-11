package dev.kassiopeia.blog.modules.articles.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import dev.kassiopeia.blog.modules.articles.DTOs.ArticleDTO;
import dev.kassiopeia.blog.modules.articles.entities.Article;
import dev.kassiopeia.blog.modules.articles.repositories.ArticleRepository;
import dev.kassiopeia.blog.modules.articles.services.ArticleService;
import dev.kassiopeia.blog.modules.user.services.UserService;

@RestController
@RequestMapping("/api/articles")
public class ArticleRestController {
    @Autowired
    UserService userService;
    @Autowired
    ArticleService articleService;
    @Autowired
    ArticleRepository articleRepository;

    @PostMapping
    @ResponseStatus(code = HttpStatus.CREATED)
    public ArticleDTO create() {
        var user = userService.getCurrentAuthenticatedUserOrThrowsForbidden();
        return articleService.toDataTransferObject(articleRepository.save(new Article(user)));
    }
}
