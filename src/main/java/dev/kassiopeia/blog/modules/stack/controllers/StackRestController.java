package dev.kassiopeia.blog.modules.stack.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import dev.kassiopeia.blog.exceptions.BadRequest;
import dev.kassiopeia.blog.exceptions.Conflict;
import dev.kassiopeia.blog.exceptions.NotFound;
import dev.kassiopeia.blog.exceptions.Unauthorized;
import dev.kassiopeia.blog.modules.article.repositories.ArticleRepository;
import dev.kassiopeia.blog.modules.article.services.ArticleService;
import dev.kassiopeia.blog.modules.stack.DTOs.StackDTO;
import dev.kassiopeia.blog.modules.stack.entities.Stack;
import dev.kassiopeia.blog.modules.stack.repositories.StackRepository;
import dev.kassiopeia.blog.modules.stack.services.StackService;
import dev.kassiopeia.blog.modules.user.services.UserService;
import dev.kassiopeia.blog.utilities.StringUtils;
import jakarta.websocket.server.PathParam;

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
            throw new BadRequest(
                    String.format("Descrição não é válida. Máximo de %s caracteres", StringUtils.DESCRIPTION_MAX_LEN));

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
                art.getStacks().add(stackService.toInternal(stack));
                articleRepository.save(art);
            }
        }
        return stackService.toDataTransferObject(stack);
    }

    @PatchMapping("/{stack}")
    public StackDTO patch(@PathVariable("stack") String stackName, @RequestBody StackDTO data) {
        if (StringUtils.isNullOrBlank(stackName))
            throw new BadRequest("Stack não informada");

        var user = userService.getCurrentAuthenticatedUserOrThrowsForbidden();
        if (user.isNonMod())
            throw new Unauthorized("Ação negada. Usuário sem privilégios");

        var stack = stackRepository.findByName(stackName);
        if (stack == null)
            throw new NotFound("Stack não existe");

        var newName = data.name();
        if (StringUtils.isNotNullOrBlank(newName)) {
            var stackByName = stackRepository.existsByName(newName);
            if (stackByName)
                throw new Conflict("Stack já cadastrada");
            stack.setName(newName.trim());
        }

        var description = data.description();
        if (StringUtils.isNotNullOrBlank(description)) {
            if (!StringUtils.isDescriptionTagTextValidForSEO(description))
                throw new BadRequest("Descrição não válida");

            if (StringUtils.isNotEquals(description, stack.getDescription())) {
                stack.setDescription(description.trim());
            }
        }

        stackRepository.save(stack);
        return stackService.toDataTransferObject(stack);
    }

}
