package dev.kassiopeia.blog.modules.user.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;

import dev.kassiopeia.blog.modules.user.entities.User;

public interface UserRepository extends MongoRepository<User, String> {
    User findByEmail(String email);

    User findByUsername(String username);

    boolean existsByEmail(String email);
}
