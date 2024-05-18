package dev.kassiopeia.blog.exceptions.handler;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.NoHandlerFoundException;

import dev.kassiopeia.blog.exceptions.BadRequest;
import dev.kassiopeia.blog.exceptions.Conflict;
import dev.kassiopeia.blog.exceptions.Forbidden;
import dev.kassiopeia.blog.exceptions.InternalServerError;
import dev.kassiopeia.blog.exceptions.NotFound;
import dev.kassiopeia.blog.exceptions.ServiceUnavailable;
import dev.kassiopeia.blog.exceptions.Unauthorized;
import dev.kassiopeia.blog.exceptions.DTOs.ExceptionResponseDto;
import dev.kassiopeia.blog.modules.user.entities.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@ControllerAdvice
public class GlobalExceptionHandler {
        @ResponseStatus(HttpStatus.BAD_REQUEST)
        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException ex,
                        HttpServletRequest request) {
                return new ResponseEntity<Object>(new ExceptionResponseDto(
                                LocalDateTime.now().toInstant(ZoneOffset.UTC),
                                "Failed to read the request body. Check the JSON format.",
                                request.getRequestURL().toString(),
                                HttpStatus.BAD_REQUEST.value()),
                                HttpStatus.BAD_REQUEST);
        }

        @ResponseStatus(HttpStatus.NOT_FOUND)
        @ExceptionHandler(NoHandlerFoundException.class)
        public Object handleNoHandlerFoundException(
                        NoHandlerFoundException ex, HttpServletRequest request) {
                var description = request.getRequestURL().toString();
                if (description.contains("/api/")) {
                        return new ResponseEntity<>(
                                        new ExceptionResponseDto(Instant.now(), "Recurso não econtrado", description,
                                                        HttpStatus.NOT_FOUND.value()),
                                        HttpStatus.NOT_FOUND);
                }
                var user = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
                var mv = new ModelAndView("404");
                mv.addObject("user", user instanceof User ? user : null);
                mv.setStatus(HttpStatus.NOT_FOUND);
                return mv;
        }

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
        public Object notFound(HttpServletRequest request,
                        NotFound ex) {
                return request.getServletPath().contains("/api/")
                                ? new ResponseEntity<>(
                                                new ExceptionResponseDto(LocalDateTime.now().toInstant(ZoneOffset.UTC),
                                                                ex.getMessage(), request.getRequestURL().toString(),
                                                                HttpStatus.NOT_FOUND.value()),
                                                HttpStatus.NOT_FOUND)
                                : new ModelAndView("404");
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
        public Object forbidden(HttpServletRequest request, HttpServletResponse response,
                        Forbidden ex) {
                if (!request.getServletPath().contains("/api/")) {
                        try {
                                response.sendRedirect("/session?next=" + request.getServletPath());
                                return null;
                        } catch (IOException e) {
                                e.printStackTrace();
                        }
                }
                return request.getServletPath().contains("/api/")
                                ? new ResponseEntity<>(HttpStatus.FORBIDDEN)
                                : new ModelAndView("session");
        }

        @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
        @ExceptionHandler(ServiceUnavailable.class)
        public ResponseEntity<ExceptionResponseDto> serviceUnavailable(HttpServletRequest request,
                        ServiceUnavailable ex) {
                return new ResponseEntity<>(new ExceptionResponseDto(LocalDateTime.now().toInstant(ZoneOffset.UTC),
                                ex.getMessage(), request.getRequestURL().toString(),
                                HttpStatus.SERVICE_UNAVAILABLE.value()),
                                HttpStatus.SERVICE_UNAVAILABLE);
        }
}
