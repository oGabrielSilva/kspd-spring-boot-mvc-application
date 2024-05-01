package dev.kassiopeia.blog.authentication.DTOs;

public record SessionRequestDTO(String email, String password, Boolean cookie) {

}
