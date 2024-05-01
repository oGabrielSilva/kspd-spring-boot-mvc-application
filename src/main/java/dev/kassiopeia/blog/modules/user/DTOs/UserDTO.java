package dev.kassiopeia.blog.modules.user.DTOs;

import java.util.List;

import dev.kassiopeia.blog.modules.user.entities.SocialMedia;

public record UserDTO(
                String email,
                String name,
                String username,
                String bio,
                String avatarURL,
                SocialMedia social,
                List<String> roles,
                boolean isEmailChecked) {

}
