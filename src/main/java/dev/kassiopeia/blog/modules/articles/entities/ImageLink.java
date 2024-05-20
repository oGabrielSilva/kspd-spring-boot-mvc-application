package dev.kassiopeia.blog.modules.articles.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ImageLink {
    private String bucket;
    private String privateURL;
    private String publicURL;
    private String nanoId;
    private String path;
}
