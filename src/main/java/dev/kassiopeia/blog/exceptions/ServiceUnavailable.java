package dev.kassiopeia.blog.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.SERVICE_UNAVAILABLE)
public class ServiceUnavailable extends InternalServerError {
    public ServiceUnavailable(String message) {
        super(message);
    }
}
