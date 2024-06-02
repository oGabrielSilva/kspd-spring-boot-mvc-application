package dev.kassiopeia.blog.modules.external.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.amazonaws.services.s3.model.ObjectMetadata;

import dev.kassiopeia.blog.exceptions.BadRequest;
import dev.kassiopeia.blog.modules.aws.services.AmazonS3Service;
import dev.kassiopeia.blog.modules.external.DTOs.ContactDTO;
import dev.kassiopeia.blog.modules.external.entities.Contact;
import dev.kassiopeia.blog.modules.external.repositories.ContactRepository;
import dev.kassiopeia.blog.modules.external.validation.ContactValidation;

@RestController
@RequestMapping("/api/contact")
public class ContactRestController {
    @Autowired
    ContactValidation validation;
    @Autowired
    ContactRepository contactRepository;

    @Autowired
    AmazonS3Service s3Service;

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @ResponseStatus(code = HttpStatus.CREATED)
    public void create(@RequestPart(required = false, name = "file") MultipartFile file,
            @ModelAttribute @RequestBody ContactDTO dto) {
        if (!validation.isNameValid(dto.name()))
            throw new BadRequest("Nome inválido ou não informado");

        if (!validation.isEmailValid(dto.email()))
            throw new BadRequest("Email inválido ou não informado");

        if (!validation.isSubjectValid(dto.subject()))
            throw new BadRequest("Informe um assunto válido");

        if (!validation.isMessageValid(dto.message()))
            throw new BadRequest("Os limites da mensagem não foram respeitados");

        Contact contact = contactRepository
                .save(new Contact(dto.name(), dto.surname(), dto.email(), dto.subject(), dto.message(),
                        dto.country(), null));

        if (file != null && validation.isFileValid(file.getSize())) {
            ObjectMetadata mt = new ObjectMetadata();
            mt.addUserMetadata("email", dto.email());
            mt.addUserMetadata("subject", dto.subject());
            mt.addUserMetadata("country", dto.country());
            var s3File = s3Service.uploadMultipart(file, "contact/" + contact.getId(), mt);
            if (s3File.success()) {
                contact.setFileURL(s3File.url());
                contactRepository.save(contact);
            }
        }
    }

}
