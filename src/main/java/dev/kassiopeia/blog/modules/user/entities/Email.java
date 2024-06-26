package dev.kassiopeia.blog.modules.user.entities;

import org.springframework.data.mongodb.core.mapping.Document;

import dev.kassiopeia.blog.data.entities.Metadata;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document
@EqualsAndHashCode(callSuper = false)
public class Email extends Metadata {
    @Setter(AccessLevel.NONE)
    private String id;
    private String code;

    private String userId;

    public Email(String code, String userId) {
        this.code = code;
        this.userId = userId;
    }
}
