package dev.kassiopeia.blog.modules.user.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import dev.kassiopeia.blog.data.constants.AppConstants;
import dev.kassiopeia.blog.exceptions.NotFound;
import dev.kassiopeia.blog.exceptions.Unauthorized;
import dev.kassiopeia.blog.modules.article.repositories.ArticleRepository;
import dev.kassiopeia.blog.modules.user.repositories.UserRepository;
import dev.kassiopeia.blog.modules.user.services.UserService;

@Controller
@RequestMapping("/u")
public class UserController {

    @Autowired
    UserRepository userRepository;
    @Autowired
    UserService userService;

    @Autowired
    ArticleRepository articleRepository;

    @GetMapping("/{username}")
    public ModelAndView profile(@PathVariable String username, ModelAndView mv) {
        var authenticatedUser = userService.getCurrentAuthenticatedUser();
        if (authenticatedUser != null && authenticatedUser.getUsername().equals(username)) {
            mv.setViewName("profile-edit");
            mv.addObject(AppConstants.PAGE_TITLE, authenticatedUser.getUsername());
            return mv;
        }

        var profile = userRepository.findByUsername(username);
        if (profile == null) {
            throw new NotFound("Usuário não existe");
        }

        mv.setViewName("profile-user");
        mv.addObject("profile", profile);
        var social = profile.getSocial();
        mv.addObject("social", social);

        mv.addObject(AppConstants.PAGE_TITLE, profile.getUsername());
        return mv;
    }

    @GetMapping("/{username}/articles")
    public ModelAndView articlesView(@PathVariable String username, ModelAndView mv) {
        var user = userService.getCurrentAuthenticatedUser();
        if (user == null || !user.getUsername().equals(username)) {
            throw new NotFound("Usuário não existe");
        }

        if (user.isNonAuthor())
            throw new Unauthorized("Oopss... você não tem permissão para acessar tal recurso");

        mv.setViewName("profile-articles");
        var articles = articleRepository.findAllByEditorId(user.getId());
        mv.addObject("articles", articles);
        return mv;
    }

}
