package dev.kassiopeia.blog.modules.article.entities;

import java.time.Instant;
import java.util.ArrayList;

import dev.kassiopeia.blog.modules.user.DTOs.UserInternalDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ArticleMetadata {
    private boolean isPublished = false;
    private boolean isHidden = true;
    private InnerHidingInformation lastHidingInformation = null;
    private Instant publishedAt = null;
    private UserInternalDTO publishedBy = null;

    @Data
    @ToString
    @AllArgsConstructor
    @NoArgsConstructor
    private final static class InnerHidingInformation {
        private UserInternalDTO hiddenBy = null;
        private String reason = null;
        private ArrayList<String> relatedImagesLink = new ArrayList<>();
        private boolean canResourceOwnerViewReportedImages = true;
        private boolean canResourceOwnerViewReportedReason = true;
        private Instant hiddenAt;
    }

}
