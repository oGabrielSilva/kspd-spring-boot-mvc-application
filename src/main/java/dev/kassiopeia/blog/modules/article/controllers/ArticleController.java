package dev.kassiopeia.blog.modules.article.controllers;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.servlet.ModelAndView;

import dev.kassiopeia.blog.data.constants.AppConstants;
import dev.kassiopeia.blog.exceptions.BadRequest;
import dev.kassiopeia.blog.exceptions.InternalServerError;
import dev.kassiopeia.blog.exceptions.NotFound;
import dev.kassiopeia.blog.modules.article.entities.Article;
import dev.kassiopeia.blog.modules.article.repositories.ArticleRepository;
import dev.kassiopeia.blog.modules.article.services.ArticleService;
import dev.kassiopeia.blog.modules.aws.services.AmazonS3Service;
import dev.kassiopeia.blog.modules.stack.entities.Stack;
import dev.kassiopeia.blog.modules.stack.repositories.StackRepository;
import dev.kassiopeia.blog.modules.user.repositories.UserRepository;
import dev.kassiopeia.blog.modules.user.services.UserService;
import dev.kassiopeia.blog.utilities.StringUtils;

@Controller
public class ArticleController {
    @Autowired
    AmazonS3Service s3Service;
    @Autowired
    ArticleRepository articleRepository;
    @Autowired
    ArticleService articleService;
    @Autowired
    StackRepository stackRepository;
    @Autowired
    UserService userService;
    @Autowired
    UserRepository userRepository;

    @GetMapping("/{slug}")
    public ModelAndView view(@PathVariable("slug") String slug) {
        if (StringUtils.isNullOrBlank(slug)) {
            throw new NotFound("Slug não informado");
        }

        Article article = articleRepository.findBySlug(slug);
        if (article == null) {
            throw new NotFound("Artigo não existe");
        }

        var user = userService.getCurrentAuthenticatedUser();

        if (article.getMetadata().isPublished() || user != null && articleService.canEdit(user, article)) {
            var mv = new ModelAndView("article");
            mv.addObject("article", article);
            mv.addObject(AppConstants.PAGE_TITLE,
                    StringUtils.isNullOrBlank(article.getTitle()) ? article.getCreatedBy().name() : article.getTitle());
            mv.addObject("isEditor", articleService.canEdit(user, article));

            var editors = userRepository.findAllById(article.getEditors().stream().map(ed -> ed.id()).toList());
            mv.addObject("editors", editors);
            return mv;
        }

        throw new NotFound("Não foi encontrado nenhum artigo disponível");
    }

    @GetMapping("/{slug}/edit")
    public ModelAndView edit(@PathVariable("slug") String slug) {
        if (StringUtils.isNullOrBlank(slug)) {
            throw new NotFound("Slug não informado");
        }

        Article article = articleRepository.findBySlug(slug);
        if (article == null) {
            throw new NotFound("Artigo não existe");
        }

        var user = userService.getCurrentAuthenticatedUserOrThrowsForbidden();
        var isEditor = article.getEditors().stream().anyMatch(e -> e.id().equals(user.getId()));
        if (!isEditor) {
            return new ModelAndView("redirect:/" + slug);
        }
        var mv = new ModelAndView("article-edit");
        mv.addObject("article", article);
        mv.addObject(AppConstants.PAGE_TITLE,
                StringUtils.isNullOrBlank(article.getTitle()) ? article.getCreatedBy().name() : article.getTitle());
        mv.addObject("title", article.getTitle());
        return mv;
    }

    @GetMapping("/{slug}/edit/metadata")
    public ModelAndView editMetadata(@PathVariable("slug") String slug) {
        if (StringUtils.isNullOrBlank(slug)) {
            throw new NotFound("Slug não informado");
        }

        Article article = articleRepository.findBySlug(slug);
        if (article == null) {
            throw new NotFound("Artigo não existe");
        }

        var user = userService.getCurrentAuthenticatedUserOrThrowsForbidden();
        var isEditor = article.getEditors().stream().anyMatch(e -> e.id().equals(user.getId()));
        if (!isEditor) {
            return new ModelAndView("redirect:/" + slug);
        }
        List<Stack> stacks = stackRepository
                .findAllByNameNotIn(article.getStacks().stream().map(stack -> stack.name()).toList());

        var mv = new ModelAndView("article-metadata");
        mv.addObject("ownerId", article.getCreatedBy().id());
        mv.addObject("article", article);
        mv.addObject(AppConstants.PAGE_TITLE,
                StringUtils.isNullOrBlank(article.getTitle()) ? article.getCreatedBy().name() : article.getTitle());
        mv.addObject("title", article.getTitle());
        mv.addObject("stacks", stacks);
        return mv;
    }

    @GetMapping("/article/{articleSlug}/{blobId}")
    public ResponseEntity<Resource> getBlob(@PathVariable("articleSlug") String articleSlug,
            @PathVariable("blobId") String blobId) {
        if (StringUtils.isNullOrBlank(articleSlug))
            throw new BadRequest("Artigo não definido");
        if (StringUtils.isNullOrBlank(blobId))
            throw new BadRequest("Id de imagem não definido na requisição");
        var article = articleRepository.findBySlug(articleSlug);
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
