package dev.kassiopeia.blog.app.configurations;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import dev.kassiopeia.blog.app.filters.ServletRequestWrapperFilter;

@Configuration
public class ApplicationWebMvcConfigurer implements WebMvcConfigurer {

    @Bean
    ServletRequestWrapperFilter getServletRequestWrapperFilter() {
        return new ServletRequestWrapperFilter();
    }
}
