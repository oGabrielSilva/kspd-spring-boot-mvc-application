package dev.kassiopeia.blog.exceptions.DTOs;

import java.time.Instant;

public record ExceptionResponseDto(Instant timestamp, String message, String url, int status) {

}
