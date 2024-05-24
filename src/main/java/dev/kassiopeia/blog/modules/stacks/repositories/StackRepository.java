package dev.kassiopeia.blog.modules.stacks.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import dev.kassiopeia.blog.modules.stacks.entities.Stack;

public interface StackRepository extends MongoRepository<Stack, String> {
    Stack findByName(String name);

    boolean existsByName(String name);

    List<Stack> findAllByNameNotIn(List<String> names);
}
