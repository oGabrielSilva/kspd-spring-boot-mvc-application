package dev.kassiopeia.blog.modules.user.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;

import dev.kassiopeia.blog.modules.user.entities.ApplicationBecomeAuthor;

public interface ApplicationBecomeAuthorRepository extends MongoRepository<ApplicationBecomeAuthor, String> {

}
