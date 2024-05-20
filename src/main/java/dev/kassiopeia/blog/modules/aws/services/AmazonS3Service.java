package dev.kassiopeia.blog.modules.aws.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.S3Object;

import dev.kassiopeia.blog.modules.aws.DTOs.S3FileDTO;

@Service
public class AmazonS3Service {
    private static final String urlBase = "https://s3.sa-east-1.amazonaws.com/[bucketName]/[filePath]";
    @Value("${aws.s3.bucket}")
    String bucketName;

    @Autowired
    AmazonS3 s3Client;

    public S3Object getObject(String id) {
        return s3Client.getObject(bucketName, id);
    }

    public S3FileDTO uploadMultipart(MultipartFile file, String pathWithName, ObjectMetadata metadata) {
        try {
            var is = file.getInputStream();
            if (metadata == null) {
                metadata = new ObjectMetadata();
            }
            metadata.setContentLength(file.getSize());
            metadata.setContentType(file.getContentType());
            var obj = s3Client.putObject(bucketName, pathWithName, is, metadata);
            if (obj == null)
                throw new Exception("S3 exception");
            is.close();
            return new S3FileDTO(normalizeURL(pathWithName), obj, bucketName, pathWithName, true);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("\n\n" + e.getMessage());
            return new S3FileDTO(null, null, null, null, false);
        }
    }

    public boolean delete(String id) {
        try {
            s3Client.deleteObject(bucketName, id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private String normalizeURL(String pathWithName) {
        return urlBase.replace("[bucketName]", bucketName).replace("[filePath]", pathWithName);
    }

}
