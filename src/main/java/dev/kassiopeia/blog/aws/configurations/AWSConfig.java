package dev.kassiopeia.blog.aws.configurations;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;

@Configuration
public class AWSConfig {

    private static AmazonS3 amazonS3Singleton = null;

    @Bean
    AmazonS3 amazonS3() {

        if (amazonS3Singleton == null) {
            amazonS3Singleton = AmazonS3ClientBuilder.standard()
                    .withRegion(Regions.SA_EAST_1)
                    .build();
        }
        return amazonS3Singleton;
    }
}
