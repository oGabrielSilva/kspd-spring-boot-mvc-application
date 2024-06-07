package dev.kassiopeia.blog.modules.article.DTOs;

import java.time.Instant;
import java.util.List;
import java.util.Set;

import dev.kassiopeia.blog.modules.article.entities.ArticleMetadata;
import dev.kassiopeia.blog.modules.stack.DTOs.StackDTO;

public record ArticlePageView(String slug,
                String title,
                String description,
                Set<String> keywords,
                List<StackDTO> stacks,
                long views,
                String lang,
                Instant updatedAt,
                ArticleMetadata metadata,
                boolean isActive) {

}
