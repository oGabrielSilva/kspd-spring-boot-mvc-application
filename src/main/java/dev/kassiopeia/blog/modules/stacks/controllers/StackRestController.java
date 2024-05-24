package dev.kassiopeia.blog.modules.stacks.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import dev.kassiopeia.blog.exceptions.BadRequest;
import dev.kassiopeia.blog.exceptions.Conflict;
import dev.kassiopeia.blog.exceptions.Unauthorized;
import dev.kassiopeia.blog.modules.articles.repositories.ArticleRepository;
import dev.kassiopeia.blog.modules.articles.services.ArticleService;
import dev.kassiopeia.blog.modules.stacks.DTOs.StackDTO;
import dev.kassiopeia.blog.modules.stacks.entities.Stack;
import dev.kassiopeia.blog.modules.stacks.repositories.StackRepository;
import dev.kassiopeia.blog.modules.stacks.services.StackService;
import dev.kassiopeia.blog.modules.user.services.UserService;
import dev.kassiopeia.blog.utilities.StringUtils;
import jakarta.websocket.server.PathParam;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/stack")
public class StackRestController {
    @Autowired
    UserService userService;

    @Autowired
    StackRepository stackRepository;

    @Autowired
    StackService stackService;

    @Autowired
    ArticleRepository articleRepository;

    @Autowired
    ArticleService articleService;

    @PostMapping
    @ResponseStatus(code = HttpStatus.CREATED)
    public StackDTO create(@RequestBody StackDTO stackDTO, @PathParam("article") String article) {
        if (StringUtils.isNullOrBlank(stackDTO.name()))
            throw new BadRequest("Stack não possui nome válido");
        if (StringUtils.isNotNullOrBlank(stackDTO.description())
                && StringUtils.isNotDescriptionTagTextValidForSEO(stackDTO.description()))
            throw new BadRequest("Descrição não é válida. Máximo de 160 caracteres");

        var user = userService.getCurrentAuthenticatedUserOrThrowsForbidden();
        if (user.isNonAuthor())
            throw new Unauthorized("Usuário não tem permissão para executar determinada ação");

        var stackAlreadyExists = stackRepository.existsByName(stackDTO.name());
        if (stackAlreadyExists)
            throw new Conflict("Stack já cadastrada");

        var stack = stackRepository.save(new Stack(stackDTO.name(), stackDTO.description()));
        if (StringUtils.isNotNullOrBlank(article)) {
            var art = articleRepository.findBySlug(article);
            if (art != null && articleService.canEdit(user, art)) {
                art.getStacks().add(stack);
                articleRepository.save(art);
            }
        }
        return stackService.toDataTransferObject(stack);
    }

}
