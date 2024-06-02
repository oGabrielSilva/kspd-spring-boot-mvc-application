package dev.kassiopeia.blog.modules.external.validation;

import org.springframework.stereotype.Component;

import dev.kassiopeia.blog.authentication.validation.AuthenticationValidation;
import dev.kassiopeia.blog.utilities.StringUtils;

@Component
public class ContactValidation {
    public static final int messageMaxLen = 1000;
    public static final long fileMaxLen = 5_000_000;

    public boolean isNameValid(String name) {
        return StringUtils.isNotNullOrBlank(name);
    }

    public boolean isEmailValid(String email) {
        return StringUtils.isNotNullOrBlank(email) && email.matches(AuthenticationValidation.emailRegex);
    }

    public boolean isSubjectValid(String subject) {
        return StringUtils.isNotNullOrBlank(subject);
    }

    public boolean isMessageValid(String message) {
        return StringUtils.isNotNullOrBlank(message) &&
                message.trim().length() > 1 &&
                message.trim().length() <= messageMaxLen;
    }

    public boolean isFileValid(long fileSize) {
        return fileSize > 0 && fileSize <= fileMaxLen;
    }
}
