package dev.kassiopeia.blog.modules.articles.DTOs;

import java.util.List;

import dev.kassiopeia.blog.modules.stacks.DTOs.StackDTO;
import dev.kassiopeia.blog.modules.user.DTOs.UserDTO;

public record ArticleDTO(
                Links links,
                String slug,
                String title,
                String content,
                String description,
                List<String> keywords,
                List<StackDTO> stacks,
                List<UserDTO> editors,
                long views,
                String lang) {

        public static final record Links(String content, String edit) {
        }
}
