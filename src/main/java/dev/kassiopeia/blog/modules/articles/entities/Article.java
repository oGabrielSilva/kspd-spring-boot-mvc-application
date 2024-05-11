package dev.kassiopeia.blog.modules.articles.entities;

import java.util.ArrayList;
import java.util.stream.Stream;

import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.aventrix.jnanoid.jnanoid.NanoIdUtils;

import dev.kassiopeia.blog.data.entities.Metadata;
import dev.kassiopeia.blog.modules.stacks.entities.Stack;
import dev.kassiopeia.blog.modules.user.DTOs.UserInternalDTO;
import dev.kassiopeia.blog.modules.user.entities.User;
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
public class Article extends Metadata {
    @Setter(AccessLevel.NONE)
    private String id;

    @Indexed(unique = true)
    private String slug = String.valueOf(System.currentTimeMillis()).concat(NanoIdUtils.randomNanoId());

    private String title = "";
    private String content = "";
    private String description = "";
    private ArrayList<String> keywords = new ArrayList<>();
    private long views = 0;

    private ArrayList<Stack> stacks = new ArrayList<>();
    private String lang = "pt-BR";

    private ArrayList<UserInternalDTO> editors = new ArrayList<>();

    public Article(User... editors) {
        pushEditors(editors);
    }

    public void pushEditors(User... editors) {
        var authors = Stream.of(editors).map(user -> {
            return user.isEmailChecked() ? new UserInternalDTO(user.getId(), user.getEmail(), user.getName(),
                    user.getUsername(), user.getRole(), user.isEmailChecked(), user.getVersion()) : null;
        }).filter(user -> user != null).toList();
        if (!authors.isEmpty())
            this.editors.addAll(authors);
    }

}
