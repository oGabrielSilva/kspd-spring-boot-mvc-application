package dev.kassiopeia.blog.authentication.interceptors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import dev.kassiopeia.blog.modules.user.entities.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AddUserToModelViewInterceptor implements HandlerInterceptor {

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
            ModelAndView modelAndView) throws Exception {
        var user = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        modelAndView.addObject("user", (user != null && user instanceof User) ? user : null);
    }
}
