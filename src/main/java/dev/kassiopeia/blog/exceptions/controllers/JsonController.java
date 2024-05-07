package dev.kassiopeia.blog.exceptions.controllers;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.WebRequest;

import dev.kassiopeia.blog.exceptions.DTOs.ExceptionResponseDto;

import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
public class JsonController {
    @GetMapping("/api/json-404")
    public ExceptionResponseDto json(WebRequest request) {
        return new ExceptionResponseDto(Instant.now(), "Recurso não econtrado", "",
                HttpStatus.NOT_FOUND.value());
    }

}
