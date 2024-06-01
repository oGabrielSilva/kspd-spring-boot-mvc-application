package dev.kassiopeia.blog.modules.article.DTOs;

import java.util.List;
import java.util.Set;

import dev.kassiopeia.blog.modules.stack.DTOs.StackDTO;
import dev.kassiopeia.blog.modules.user.DTOs.UserDTO;

public record ArticleDTO(
                Links links,
                String slug,
                String title,
                String content,
                String description,
                Set<String> keywords,
                List<StackDTO> stacks,
                List<UserDTO> editors,
                long views,
                String lang) {

        public static final record Links(String content, String edit) {
        }
}
