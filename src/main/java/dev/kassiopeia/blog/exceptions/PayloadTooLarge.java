package dev.kassiopeia.blog.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.PAYLOAD_TOO_LARGE)
public class PayloadTooLarge extends InternalServerError {

    public PayloadTooLarge(String message) {
        super(message);
    }
}