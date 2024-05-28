package dev.kassiopeia.blog.modules.articles.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.ToString;

@Data
@ToString
@AllArgsConstructor
public class ArticleFont {
    private String fontName;
    private String fontType;

    public ArticleFont() {
        fontName = "";
        fontType = "";
    }
}
