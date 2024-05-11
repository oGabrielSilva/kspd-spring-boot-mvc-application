package dev.kassiopeia.blog.modules.user.enums;

public enum ApplicationBecomeAuthorState {
    PENDING("PENDING"),
    APPROVED("APPROVED"),
    REJECTED("REJECTED"),
    VIEWED("VIEWED");

    private final String stateDescription;

    ApplicationBecomeAuthorState(String stateDescription) {
        this.stateDescription = stateDescription;
    }

    public String getStateDescription() {
        return stateDescription;
    }
}