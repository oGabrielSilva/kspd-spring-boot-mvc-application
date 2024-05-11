package dev.kassiopeia.blog.modules.user.entities;

import org.springframework.data.mongodb.core.mapping.Document;

import dev.kassiopeia.blog.data.entities.Metadata;
import dev.kassiopeia.blog.modules.user.enums.ApplicationBecomeAuthorState;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Document
@EqualsAndHashCode(callSuper = false)
public class ApplicationBecomeAuthor extends Metadata {
    @Setter(AccessLevel.NONE)
    private String id;
    private ApplicationBecomeAuthorState state = ApplicationBecomeAuthorState.PENDING;

}
