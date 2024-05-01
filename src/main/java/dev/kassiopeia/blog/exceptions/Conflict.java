package dev.kassiopeia.blog.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.CONFLICT)
public class Conflict extends InternalServerError {
    public Conflict(String message) {
        super(message);
    }
}
