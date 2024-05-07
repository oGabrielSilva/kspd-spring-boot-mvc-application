package dev.kassiopeia.blog.modules.user.entities;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Email {

    @Setter(AccessLevel.NONE)
    private String id;

    private String code;

    private String userId;

    @CreatedDate
    private Instant createdAt;

    public Email(String code, String userId) {
        this.code = code;
        this.userId = userId;
    }
}
