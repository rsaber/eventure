package com.eventure.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception class which returns a 409 CONFLICT with 'Conflict' as the body when it is thrown and not caught.
 */
@ResponseStatus(value= HttpStatus.CONFLICT, reason="Conflict")
public class ConflictException extends RuntimeException {
    public ConflictException(Throwable cause) {
        super(cause);
    }
    public ConflictException(String cause) {
        super(cause);
    }
}
