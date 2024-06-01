package dev.kassiopeia.blog.modules.article.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import dev.kassiopeia.blog.modules.article.DTOs.InternalArticleDTO;
import dev.kassiopeia.blog.modules.article.entities.Article;

public interface ArticleRepository extends MongoRepository<Article, String> {
    Article findBySlug(String slug);

    @Query("{ 'stacks.name' : ?0 }")
    List<InternalArticleDTO> findAllByStackName(String stackName);
}
