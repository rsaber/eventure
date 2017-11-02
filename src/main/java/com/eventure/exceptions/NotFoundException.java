package com.eventure.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception class which returns a 404 NOT FOUND with 'Not Found' as the body when it is thrown and not caught.
 */
@ResponseStatus(value= HttpStatus.NOT_FOUND, reason="Not Found")
public class NotFoundException extends RuntimeException {
    public NotFoundException(Throwable cause) {
        super(cause);
    }
    public NotFoundException(String cause) {
        super(cause);
    }
}
