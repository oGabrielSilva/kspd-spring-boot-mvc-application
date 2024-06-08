package dev.kassiopeia.blog.modules.article.configurations;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import dev.kassiopeia.blog.modules.article.interceptors.ArticleInterceptor;

@Configuration
public class ArticleMvcConfigurer implements WebMvcConfigurer {

    @Autowired
    ArticleInterceptor articleInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(articleInterceptor).excludePathPatterns("/api/**", "/public/**", "/session",
                "/forgot-password", "/error").addPathPatterns("/", "/**");
    }

}
