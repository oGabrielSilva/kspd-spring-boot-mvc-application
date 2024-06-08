package dev.kassiopeia.blog.modules.stack.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import dev.kassiopeia.blog.data.constants.AppConstants;
import dev.kassiopeia.blog.exceptions.BadRequest;
import dev.kassiopeia.blog.exceptions.NotFound;
import dev.kassiopeia.blog.exceptions.ServiceUnavailable;
import dev.kassiopeia.blog.modules.article.repositories.ArticleRepository;
import dev.kassiopeia.blog.modules.stack.repositories.StackRepository;
import dev.kassiopeia.blog.modules.stack.services.StackService;
import dev.kassiopeia.blog.modules.user.services.UserService;
import dev.kassiopeia.blog.utilities.StringUtils;

@Controller
@RequestMapping("/stack")
public class StackController {
    @Autowired
    StackRepository stackRepository;
    @Autowired
    StackService stackService;

    @Autowired
    UserService userService;

    @Autowired
    ArticleRepository articleRepository;

    @GetMapping
    public ModelAndView index(ModelAndView mv) {
        var stacks = stackRepository.findAllDTO();

        mv.addObject("stacks", stacks);

        var user = userService.getCurrentAuthenticatedUser();
        mv.addObject("isAuthor", user != null && user.isAuthor());
        mv.addObject("isMod", user != null && user.isMod());
        mv.addObject("isAdmin", user != null && user.isAdmin());

        mv.setViewName("stacks");

        mv.addObject(AppConstants.PAGE_TITLE, "Stacks | Categorias");
        return mv;
    }

    @GetMapping("/{stack}")
    public ModelAndView stack(ModelAndView mv, @PathVariable("stack") String stackName) {

        if (StringUtils.isNullOrBlank(stackName))
            throw new BadRequest("Informe a stack");

        var stack = stackRepository.findByName(stackName);
        if (stack == null)
            throw new NotFound("Stack não existe");

        mv.setViewName("stack");
        mv.addObject("stack", stack);
        mv.addObject("stackDTO", stackService.toDataTransferObject(stack));

        var posts = articleRepository.findAllByStackName(stack.getName());
        mv.addObject("posts", posts);

        mv.addObject(AppConstants.PAGE_TITLE, stack.getName());
        return mv;

    }

    // Método será movido para o admin
    @SuppressWarnings("unused")
    @GetMapping("/{stack}/state")
    public ModelAndView state(ModelAndView mv, @PathVariable("stack") String stackName) {
        if (true)
            throw new ServiceUnavailable("Método depreciado");

        if (StringUtils.isNullOrBlank(stackName))
            throw new BadRequest("Informe a stack");

        var user = userService.getCurrentAuthenticatedUser();
        if (user == null) {
            mv.setViewName("redirect:/session?next=/stack/" + stackName + "/state");
            return mv;
        }

        if (user.isAdmin()) {
            var stack = stackRepository.findByName(stackName);
            if (stack == null)
                throw new NotFound("Stack não existe");

            mv.setViewName("stack-state");
            mv.addObject("stack", stack);
            mv.addObject("stackDTO", stackService.toDataTransferObject(stack));
            return mv;
        }

        mv.setViewName("404");
        return mv;
    }

}
