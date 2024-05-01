package dev.kassiopeia.blog.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.UNAUTHORIZED)
public class Unauthorized extends InternalServerError {
    public Unauthorized(String message) {
        super(message);
    }
}
