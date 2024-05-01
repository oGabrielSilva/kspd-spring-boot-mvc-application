package dev.kassiopeia.blog.authentication.DTOs;

import dev.kassiopeia.blog.modules.user.DTOs.UserDTO;

public record SessionResponseDTO(String token, UserDTO user) {

}
