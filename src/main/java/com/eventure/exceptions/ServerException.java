package com.eventure.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception class which returns a 500 INTERNAL SERVER ERROR with 'Failed' as the body when it is thrown and not caught.
 */
@ResponseStatus(value= HttpStatus.INTERNAL_SERVER_ERROR, reason="Failed")
public class ServerException extends RuntimeException {
    public ServerException(Throwable cause) {
        super(cause);
    }
    public ServerException(String cause) {
        super(cause);
    }
}
