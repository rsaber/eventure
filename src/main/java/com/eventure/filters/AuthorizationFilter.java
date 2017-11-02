package com.eventure.filters;

import org.springframework.http.HttpStatus;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import static com.eventure.entities.SessionToken.CURRENT_USER_REQUEST_ATTRIBUTE;

/**
 * Block the request if no user is logged in. This filter should only be applied to backend apis that a user must be
 * logged in to access.
 */
public class AuthorizationFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        if (request.getAttribute(CURRENT_USER_REQUEST_ATTRIBUTE) == null) {
            HttpServletResponse resp = (HttpServletResponse) response;
            resp.sendError(HttpStatus.UNAUTHORIZED.value(), "User must be logged in.");
        } else {
            chain.doFilter(request, response);
        }
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void destroy() {
    }
}
