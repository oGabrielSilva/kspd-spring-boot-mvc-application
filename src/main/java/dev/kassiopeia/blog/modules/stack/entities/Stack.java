package dev.kassiopeia.blog.modules.stack.entities;

import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import dev.kassiopeia.blog.data.entities.Metadata;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
@EqualsAndHashCode(callSuper = false)
@Document
public class Stack extends Metadata {
    @Setter(AccessLevel.NONE)
    private String id;

    @Indexed(unique = true)
    private String name;
    private String description;

    public Stack(String name, String description) {
        this.name = name;
        this.description = description;
    }
}
