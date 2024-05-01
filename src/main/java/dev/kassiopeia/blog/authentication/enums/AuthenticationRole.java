package dev.kassiopeia.blog.authentication.enums;

public enum AuthenticationRole {
    COMMON("COMMON"), AUTHOR("AUTHOR"), MODERATOR("MODERATOR"), ADMIN("ADMIN"), ROOT("ROOT");

    private final String descriptor;

    AuthenticationRole(String role) {
        descriptor = role;
    }

    public String asString() {
        return descriptor;
    }
}
