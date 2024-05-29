package dev.kassiopeia.blog.app.filters;

import java.io.IOException;

import org.springframework.stereotype.Component;

import dev.kassiopeia.blog.utilities.StringUtils;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;

@Component
public class ServletRequestWrapperFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequestWrapper requestWrapper = new HttpServletRequestWrapper((HttpServletRequest) request) {
            @Override
            public String getRequestURI() {
                String requestURI = super.getRequestURI();
                return StringUtils.removeEnd(requestURI, "/");
            }
        };
        chain.doFilter(requestWrapper, response);
    }

}
