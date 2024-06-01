package dev.kassiopeia.blog.modules.stack.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import dev.kassiopeia.blog.modules.stack.DTOs.StackDTO;
import dev.kassiopeia.blog.modules.stack.entities.Stack;

public interface StackRepository extends MongoRepository<Stack, String> {
    Stack findByName(String name);

    boolean existsByName(String name);

    List<Stack> findAllByNameNotIn(List<String> names);

    @Query(value = "{}", fields = "{ 'name' : 1, 'description' : 1 }")
    List<StackDTO> findAllDTO();
}
