package dev.kassiopeia.blog.modules.article.interceptors;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import dev.kassiopeia.blog.modules.article.entities.Article;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class ArticleInterceptor implements HandlerInterceptor {

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
            ModelAndView mv) throws Exception {
        var article = mv != null ? mv.getModel().get("article") : null;

        if (article != null && article instanceof Article) {
            mv.addObject("pageDescription", ((Article) article).getDescription());
        }
    }

}
