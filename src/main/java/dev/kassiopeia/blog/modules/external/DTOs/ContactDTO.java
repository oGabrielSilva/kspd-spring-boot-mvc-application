package dev.kassiopeia.blog.modules.external.DTOs;

public record ContactDTO(
                String name,
                String surname,
                String email,
                String subject,
                String message,
                String country,
                Boolean isReport) {

}
