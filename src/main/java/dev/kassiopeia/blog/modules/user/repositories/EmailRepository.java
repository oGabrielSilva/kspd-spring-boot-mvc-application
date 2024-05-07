package dev.kassiopeia.blog.modules.user.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import dev.kassiopeia.blog.modules.user.entities.Email;

public interface EmailRepository extends MongoRepository<Email, String> {
    List<Email> findAllByUserId(String userId);

    Email findByCode(String code);
}
