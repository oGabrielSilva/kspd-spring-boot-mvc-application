package dev.kassiopeia.blog.modules.external.entities;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.mapping.Document;

import dev.kassiopeia.blog.modules.user.DTOs.UserInternalDTO;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
@EqualsAndHashCode(callSuper = false)
@Document
public class Contact {
    @Setter(AccessLevel.NONE)
    private String id;

    private String name;
    private String surname;
    private String email;
    private String subject;
    private String message;
    private String country;
    private String fileURL;

    public Contact(String name, String surname, String email, String subject, String message, String country,
            String fileURL) {
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.subject = subject;
        this.message = message;
        this.country = country;
        this.fileURL = fileURL;
    }

    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;
    @LastModifiedBy
    private UserInternalDTO updatedBy;

    private boolean isActive = true;

    @Version
    private Long version;
}
