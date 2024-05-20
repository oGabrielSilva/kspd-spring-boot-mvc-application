package dev.kassiopeia.blog.modules.articles.controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.aventrix.jnanoid.jnanoid.NanoIdUtils;

import dev.kassiopeia.blog.exceptions.BadRequest;
import dev.kassiopeia.blog.exceptions.InternalServerError;
import dev.kassiopeia.blog.exceptions.NotFound;
import dev.kassiopeia.blog.exceptions.Unauthorized;
import dev.kassiopeia.blog.modules.articles.DTOs.ArticleDTO;
import dev.kassiopeia.blog.modules.articles.entities.Article;
import dev.kassiopeia.blog.modules.articles.entities.ImageLink;
import dev.kassiopeia.blog.modules.articles.repositories.ArticleRepository;
import dev.kassiopeia.blog.modules.articles.services.ArticleService;
import dev.kassiopeia.blog.modules.aws.services.AmazonS3Service;
import dev.kassiopeia.blog.modules.user.services.UserService;
import dev.kassiopeia.blog.utilities.StringUtils;

@RestController
@RequestMapping("/api/articles")
public class ArticleRestController {
    @Autowired
    UserService userService;
    @Autowired
    ArticleService articleService;
    @Autowired
    ArticleRepository articleRepository;
    @Autowired
    AmazonS3Service s3Service;

    @PostMapping
    @ResponseStatus(code = HttpStatus.CREATED)
    public ArticleDTO create() {
        var user = userService.getCurrentAuthenticatedUserOrThrowsForbidden();
        return articleService.toDataTransferObject(articleRepository.save(new Article(user)));
    }

    @GetMapping("/{slug}")
    public ArticleDTO get(@PathVariable("slug") String slug) {
        if (StringUtils.isNullOrBlank(slug))
            throw new BadRequest("Informe o slug do artigo");
        var article = articleRepository.findBySlug(slug);
        if (article == null)
            throw new NotFound("Artigo com slug informado não existe");
        return articleService.toDataTransferObject(article);
    }

    @PostMapping("/{slug}/blob")
    public Map<String, String> uploadBlob(@RequestPart("blob") MultipartFile blob, @PathVariable("slug") String slug) {
        if (StringUtils.isNullOrBlank(slug))
            throw new BadRequest("Slug não informado");
        if (blob.isEmpty())
            throw new BadRequest("Blob inválido");
        if (blob.getContentType() == null || !blob.getContentType().contains("image"))
            throw new BadRequest("Tipo de conteúdo não suportado");
        var user = userService.getCurrentAuthenticatedUserOrThrowsForbidden();
        var article = articleRepository.findBySlug(slug);
        if (article == null)
            throw new BadRequest("Artigo não encontrado");
        if (articleService.cannotEdit(user, article))
            throw new Unauthorized("Usuário não tem a permissão de modificar o artigo " + slug);
        var id = NanoIdUtils.randomNanoId();
        var s3 = s3Service.uploadMultipart(blob, "articles/" + slug + '/' + id, null);
        if (!s3.success())
            throw new InternalServerError("Erro ao fazer upload da imagem");
        var link = new ImageLink(s3.bucket(), s3.url(), "/articles/" + slug + "/" + id, id,
                s3.path());
        article.getImages().add(link);
        articleRepository.save(article);
        return Map.of("url", link.getPublicURL(), "id", id);
    }

    @DeleteMapping("/{slug}/{nanoId}")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void uploadBlob(@PathVariable("slug") String slug, @PathVariable("nanoId") String nanoId) {
        if (StringUtils.isNullOrBlank(slug))
            throw new BadRequest("Slug não informado");
        if (StringUtils.isNullOrBlank(nanoId))
            throw new BadRequest("Id não informado");
        var user = userService.getCurrentAuthenticatedUserOrThrowsForbidden();
        var article = articleRepository.findBySlug(slug);
        if (article == null)
            throw new NotFound("Artigo não encontrado");
        if (articleService.cannotEdit(user, article))
            throw new Unauthorized("Usuário não tem a permissão de modificar o artigo " + slug);
        var link = article.getImages().stream().filter(img -> img.getNanoId().equals(nanoId)).findFirst();
        if (link.isEmpty())
            throw new NotFound("Imagem não encontrada");
        article.getImages().remove(link.get());
        var success = s3Service.delete(link.get().getPath());
        if (!success)
            throw new InternalServerError("Erro ao deletar a imagem " + nanoId);
        articleRepository.save(article);
    }
}
