package dev.kassiopeia.blog.modules.articles.controllers;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import dev.kassiopeia.blog.exceptions.BadRequest;
import dev.kassiopeia.blog.exceptions.InternalServerError;
import dev.kassiopeia.blog.exceptions.NotFound;
import dev.kassiopeia.blog.modules.articles.repositories.ArticleRepository;
import dev.kassiopeia.blog.modules.aws.services.AmazonS3Service;
import dev.kassiopeia.blog.utilities.StringUtils;

@Controller
@RequestMapping("/articles")
public class ArticleController {
    @Autowired
    AmazonS3Service s3Service;
    @Autowired
    ArticleRepository repository;

    @GetMapping("/{articleSlug}/{blobId}")
    public ResponseEntity<Resource> getBlob(@PathVariable("articleSlug") String articleSlug,
            @PathVariable("blobId") String blobId) {
        if (StringUtils.isNullOrBlank(articleSlug))
            throw new BadRequest("Artigo não definido");
        if (StringUtils.isNullOrBlank(blobId))
            throw new BadRequest("Id de imagem não definido na requisição");
        var article = repository.findBySlug(articleSlug);
        if (article == null)
            throw new NotFound("Artigo não encontrado");
        var link = article.getImages().stream().filter(img -> img.getNanoId().equals(blobId)).findFirst();
        if (link.isEmpty())
            throw new NotFound("Imagem não encontrada");
        var blob = s3Service.getObject(link.get().getPath());
        if (blob == null)
            throw new NotFound("Avatar não encontrado");

        Resource resource;
        try {
            resource = new ByteArrayResource(blob.getObjectContent().readAllBytes());
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(blob.getObjectMetadata().getContentType()))
                    .contentLength(blob.getObjectMetadata().getContentLength())
                    .body(resource);
        } catch (IOException e) {
            throw new InternalServerError("Erro ao ler a imagem");
        }
    }
}
