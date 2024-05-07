package dev.kassiopeia.blog.modules.user.interceptors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import dev.kassiopeia.blog.modules.user.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AddUserToModelViewInterceptor implements HandlerInterceptor {
    @Autowired
    UserService userService;

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
            ModelAndView modelAndView) throws Exception {
        var user = userService.getCurrentAuthenticatedUser();
        if (user != null) {
            modelAndView.addObject("user", user);
            modelAndView.addObject("isAuthor", user.isAuthor());
            modelAndView.addObject("isModerator", user.isModerator());
            modelAndView.addObject("isAdmin", user.isAdmin());
            modelAndView.addObject("isRoot", user.isRoot());
        } else {
            modelAndView.addObject("user", null);

            modelAndView.addObject("isAuthor", false);
            modelAndView.addObject("isModerator", false);
            modelAndView.addObject("isAdmin", false);
            modelAndView.addObject("isRoot", false);
        }

    }
}
