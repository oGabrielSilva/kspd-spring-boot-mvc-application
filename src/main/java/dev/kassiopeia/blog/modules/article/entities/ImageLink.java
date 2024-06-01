package dev.kassiopeia.blog.modules.article.entities;

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
    private String slug;
    private String privateURL;
    private String nanoId;
    private String path;

    public String publicURL() {
        return String.format("/article/%s/%s", slug, nanoId);
    }
}
