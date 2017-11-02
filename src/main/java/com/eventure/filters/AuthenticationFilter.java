package com.eventure.filters;

import com.eventure.entities.SessionToken;
import com.eventure.services.SessionTokenService;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.Base64;
import java.util.Optional;

import static com.eventure.entities.SessionToken.CURRENT_SESSION_REQUEST_ATTRIBUTE;
import static com.eventure.entities.SessionToken.CURRENT_USER_REQUEST_ATTRIBUTE;
import static com.eventure.entities.SessionToken.SESSION_COOKIE_NAME;

/**
 * Adds the current logged in user as a request attribute if they exist. Removes the session cookie if it is invalid.
 */
public class AuthenticationFilter implements Filter {
    private final SessionTokenService sessionTokenService;
    private final Cipher cipher;

    public AuthenticationFilter(SessionTokenService sessionTokenService, Cipher cipher) {
        this.sessionTokenService = sessionTokenService;
        this.cipher = cipher;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;

        Optional.ofNullable(req.getCookies()).ifPresent(cookies -> Arrays.stream(cookies)
                .filter(cookie -> cookie.getName().equals(SESSION_COOKIE_NAME))
                .findAny()
                .ifPresent(sessionCookie -> {
                    try {
                        // Decrypt cookie value.
                        byte[] toDecrypt = Base64.getDecoder().decode(sessionCookie.getValue());
                        String sessionId = new String(cipher.doFinal(toDecrypt));
                        SessionToken sessionToken = sessionTokenService.getSession(Integer.parseInt(sessionId));

                        if (sessionToken != null) {
                            // Store current user and session as request attributes.
                            request.setAttribute(CURRENT_USER_REQUEST_ATTRIBUTE, sessionToken.getUser());
                            request.setAttribute(CURRENT_SESSION_REQUEST_ATTRIBUTE, sessionToken.getId());

                            // Extend the session cookie expiry.
                            sessionTokenService.setSessionToken(sessionToken, resp);
                        } else {
                            // Remove cookie if it does not correspond to a session.
                            sessionTokenService.removeSessionToken(resp);
                        }
                    } catch (IllegalBlockSizeException | BadPaddingException | NumberFormatException e) {
                        // Remove cookie if it has an invalid value.
                        sessionTokenService.removeSessionToken(resp);
                    }
                })
        );

        chain.doFilter(request, response);
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void destroy() {
    }
}
