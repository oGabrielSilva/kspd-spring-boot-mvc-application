package dev.kassiopeia.blog.modules.user.DTOs;

import dev.kassiopeia.blog.authentication.enums.AuthenticationRole;

public record UserInternalDTO(
        String id, String email,
        String name, String username,
        AuthenticationRole role, boolean isEmailChecked, long version) {

}
