package com.eventure.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception class which returns a 401 UNAUTHORIZED with 'User not logged in' as the body when it is thrown and not caught.
 */
@ResponseStatus(value= HttpStatus.UNAUTHORIZED, reason="User not logged in")
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(Throwable cause) {
        super(cause);
    }
    public UnauthorizedException(String cause) {
        super(cause);
    }
}
