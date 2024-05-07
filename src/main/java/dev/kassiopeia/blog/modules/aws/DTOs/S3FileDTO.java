package dev.kassiopeia.blog.modules.aws.DTOs;

import com.amazonaws.services.s3.model.PutObjectResult;

public record S3FileDTO(String url, PutObjectResult result, boolean success) {

}
