package dev.kassiopeia.blog.modules.external.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;

import dev.kassiopeia.blog.modules.external.entities.Contact;

public interface ContactRepository extends MongoRepository<Contact, String> {

}
