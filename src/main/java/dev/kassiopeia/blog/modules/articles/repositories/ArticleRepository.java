package dev.kassiopeia.blog.modules.articles.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;

import dev.kassiopeia.blog.modules.articles.entities.Article;

public interface ArticleRepository extends MongoRepository<Article, String> {
    Article findBySlug(String slug);
}
