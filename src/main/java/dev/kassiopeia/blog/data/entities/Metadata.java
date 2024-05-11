package dev.kassiopeia.blog.data.entities;

import java.time.Instant;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.mapping.Document;

import dev.kassiopeia.blog.modules.user.DTOs.UserInternalDTO;
import lombok.Data;
import lombok.ToString;

@Data
@Document
@ToString
public class Metadata {
    @CreatedBy
    private UserInternalDTO createdBy;

    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;
    @LastModifiedBy
    private UserInternalDTO updatedBy;

    @Version
    private Long version;
}
