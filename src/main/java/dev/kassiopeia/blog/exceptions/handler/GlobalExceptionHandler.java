package dev.kassiopeia.blog.exceptions.handler;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.stream.Stream;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import dev.kassiopeia.blog.exceptions.BadRequest;
import dev.kassiopeia.blog.exceptions.Conflict;
import dev.kassiopeia.blog.exceptions.Forbidden;
import dev.kassiopeia.blog.exceptions.InternalServerError;
import dev.kassiopeia.blog.exceptions.NotFound;
import dev.kassiopeia.blog.exceptions.Unauthorized;
import dev.kassiopeia.blog.exceptions.DTOs.ExceptionResponseDto;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

        @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ExceptionResponseDto> generic(HttpServletRequest request, Exception ex) {
                System.out.println(Instant.now());
                System.err.println("* Default exception handler: " + ex.getMessage() + "\n");
                ex.printStackTrace();
                return new ResponseEntity<>(new ExceptionResponseDto(LocalDateTime.now().toInstant(ZoneOffset.UTC),
                                "Unexpected exception", request.getRequestURL().toString(),
                                HttpStatus.INTERNAL_SERVER_ERROR.value()),
                                HttpStatus.INTERNAL_SERVER_ERROR);
        }

        @ResponseStatus(HttpStatus.BAD_REQUEST)
        @Override
        protected ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException ex,
                        HttpHeaders headers, HttpStatusCode status, WebRequest request) {
                Stream.of(headers).forEach(h -> {
                        System.out.println(h.toString());
                });
                return new ResponseEntity<Object>(new ExceptionResponseDto(
                                LocalDateTime.now().toInstant(ZoneOffset.UTC),
                                "Failed to read the request body. Check the JSON format.",
                                request.getDescription(false).replace("uri=", ""),
                                HttpStatus.BAD_REQUEST.value()),
                                HttpStatus.BAD_REQUEST);
        }

        @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
        @ExceptionHandler(InternalServerError.class)
        public ResponseEntity<ExceptionResponseDto> internalServerError(HttpServletRequest request,
                        InternalServerError ex) {
                return new ResponseEntity<>(new ExceptionResponseDto(LocalDateTime.now().toInstant(ZoneOffset.UTC),
                                ex.getMessage(), request.getRequestURL().toString(),
                                HttpStatus.INTERNAL_SERVER_ERROR.value()),
                                HttpStatus.INTERNAL_SERVER_ERROR);
        }

        @ResponseStatus(HttpStatus.BAD_REQUEST)
        @ExceptionHandler(BadRequest.class)
        public ResponseEntity<ExceptionResponseDto> badRequest(HttpServletRequest request,
                        BadRequest ex) {
                return new ResponseEntity<>(new ExceptionResponseDto(LocalDateTime.now().toInstant(ZoneOffset.UTC),
                                ex.getMessage(), request.getRequestURL().toString(), HttpStatus.BAD_REQUEST.value()),
                                HttpStatus.BAD_REQUEST);
        }

        @ResponseStatus(HttpStatus.NOT_FOUND)
        @ExceptionHandler(NotFound.class)
        public ResponseEntity<ExceptionResponseDto> notFound(HttpServletRequest request,
                        NotFound ex) {
                return new ResponseEntity<>(new ExceptionResponseDto(LocalDateTime.now().toInstant(ZoneOffset.UTC),
                                ex.getMessage(), request.getRequestURL().toString(), HttpStatus.NOT_FOUND.value()),
                                HttpStatus.NOT_FOUND);
        }

        @ResponseStatus(HttpStatus.CONFLICT)
        @ExceptionHandler(Conflict.class)
        public ResponseEntity<ExceptionResponseDto> conflict(HttpServletRequest request,
                        Conflict ex) {
                return new ResponseEntity<>(new ExceptionResponseDto(LocalDateTime.now().toInstant(ZoneOffset.UTC),
                                ex.getMessage(), request.getRequestURL().toString(), HttpStatus.CONFLICT.value()),
                                HttpStatus.CONFLICT);
        }

        @ResponseStatus(HttpStatus.UNAUTHORIZED)
        @ExceptionHandler(Unauthorized.class)
        public ResponseEntity<ExceptionResponseDto> unauthorized(HttpServletRequest request,
                        Unauthorized ex) {
                return new ResponseEntity<>(new ExceptionResponseDto(LocalDateTime.now().toInstant(ZoneOffset.UTC),
                                ex.getMessage(), request.getRequestURL().toString(), HttpStatus.UNAUTHORIZED.value()),
                                HttpStatus.UNAUTHORIZED);
        }

        @ResponseStatus(HttpStatus.FORBIDDEN)
        @ExceptionHandler(Forbidden.class)
        public ResponseEntity<Void> forbidden(HttpServletRequest request,
                        Forbidden ex) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

}
