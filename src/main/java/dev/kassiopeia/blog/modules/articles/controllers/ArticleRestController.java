package dev.kassiopeia.blog.modules.articles.controllers;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.aventrix.jnanoid.jnanoid.NanoIdUtils;

import dev.kassiopeia.blog.exceptions.BadRequest;
import dev.kassiopeia.blog.exceptions.Conflict;
import dev.kassiopeia.blog.exceptions.InternalServerError;
import dev.kassiopeia.blog.exceptions.NotFound;
import dev.kassiopeia.blog.exceptions.PayloadTooLarge;
import dev.kassiopeia.blog.exceptions.Unauthorized;
import dev.kassiopeia.blog.modules.articles.DTOs.ArticleDTO;
import dev.kassiopeia.blog.modules.articles.DTOs.ArticlePatchDTO;
import dev.kassiopeia.blog.modules.articles.entities.Article;
import dev.kassiopeia.blog.modules.articles.entities.ImageLink;
import dev.kassiopeia.blog.modules.articles.repositories.ArticleRepository;
import dev.kassiopeia.blog.modules.articles.services.ArticleService;
import dev.kassiopeia.blog.modules.aws.services.AmazonS3Service;
import dev.kassiopeia.blog.modules.stacks.DTOs.StackDTO;
import dev.kassiopeia.blog.modules.stacks.repositories.StackRepository;
import dev.kassiopeia.blog.modules.stacks.services.StackService;
import dev.kassiopeia.blog.modules.user.repositories.UserRepository;
import dev.kassiopeia.blog.modules.user.services.UserService;
import dev.kassiopeia.blog.utilities.StringUtils;

@RestController
@RequestMapping("/api/article")
public class ArticleRestController {
    @Autowired
    UserService userService;
    @Autowired
    UserRepository userRepository;
    @Autowired
    ArticleService articleService;
    @Autowired
    ArticleRepository articleRepository;
    @Autowired
    AmazonS3Service s3Service;
    @Autowired
    StackRepository stackRepository;
    @Autowired
    StackService stackService;

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

    @PatchMapping("/{slug}")
    public ResponseEntity<?> updateArticle(@PathVariable("slug") String slug, @RequestBody ArticlePatchDTO dto) {
        if (StringUtils.isNullOrBlank(slug))
            throw new BadRequest("Artigo não informado");
        var user = userService.getCurrentAuthenticatedUserOrThrowsForbidden();
        var article = articleRepository.findBySlug(slug);
        if (article == null)
            throw new NotFound("Artigo não encontrado");
        if (articleService.cannotEdit(user, article))
            throw new Unauthorized("Usuário não tem a permissão para modificar o artigo " + slug);

        var changed = false;

        if (StringUtils.isNotNullOrBlank(dto.content())) {
            var content = dto.content();
            if (StringUtils.isNotEquals(content, article.getContent())) {
                article.setContent(content);
                changed = true;
            }
        }
        if (StringUtils.isNotNullOrBlank(dto.slug())) {
            var newSlug = dto.slug();
            if (StringUtils.isNotEquals(newSlug, slug)) {
                article.setSlug(newSlug);
                changed = true;
            }
        }
        if (StringUtils.isNotNullOrBlank(dto.title())) {
            var title = dto.title();
            if (StringUtils.isNotEquals(title, article.getTitle())) {
                article.setTitle(title);
                changed = true;
            }
        }

        if (changed) {
            articleRepository.save(article);
            return ResponseEntity.ok().body(articleService.toDataTransferObject(article));
        }
        return ResponseEntity.noContent().build();
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
            throw new Unauthorized("Usuário não tem a permissão para modificar o artigo " + slug);
        var id = NanoIdUtils.randomNanoId();
        var s3 = s3Service.uploadMultipart(blob, "articles/" + slug + '/' + id, null);
        if (!s3.success())
            throw new InternalServerError("Erro ao fazer upload da imagem");
        var link = new ImageLink(s3.bucket(), s3.url(), "/article/" + slug + "/" + id, id,
                s3.path());
        article.getImages().add(link);
        articleRepository.save(article);
        return Map.of("url", link.getPublicURL(), "id", id);
    }

    // Deleta imagens pelo nanoId dela
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
            throw new Unauthorized("Usuário não tem a permissão para modificar o artigo " + slug);
        var link = article.getImages().stream().filter(img -> img.getNanoId().equals(nanoId)).findFirst();
        if (link.isEmpty())
            throw new NotFound("Imagem não encontrada");
        article.getImages().remove(link.get());
        var success = s3Service.delete(link.get().getPath());
        if (!success)
            throw new InternalServerError("Erro ao deletar a imagem " + nanoId);
        articleRepository.save(article);
    }

    @PatchMapping("/{slug}/keywords")
    public Map<String, List<String>> pushKeywords(@PathVariable("slug") String slug,
            @RequestBody Map<String, List<String>> mapKeywords) {
        if (StringUtils.isNullOrBlank(slug))
            throw new BadRequest("Slug não informado");
        if (mapKeywords == null || mapKeywords.isEmpty())
            throw new BadRequest("Nenhuma lista informada");
        var keywords = mapKeywords.get("keywords");
        if (keywords == null || keywords.isEmpty())
            throw new BadRequest("Lista vazia ou não informada");
        if (keywords.size() > 20)
            throw new PayloadTooLarge("O limite de palavras-chave é 20");
        var user = userService.getCurrentAuthenticatedUserOrThrowsForbidden();
        var article = articleRepository.findBySlug(slug);
        if (article == null)
            throw new NotFound("Artigo não encontrado");
        if (articleService.cannotEdit(user, article))
            throw new Unauthorized("Usuário não tem a permissão para modificar o artigo " + slug);
        if (article.getKeywords().size() >= 20)
            throw new Conflict("Artigo já possui a quantidade máxima de palavras-chave");
        Set<String> saved = new HashSet<String>();
        keywords.forEach(word -> {
            if (article.getKeywords().size() >= 20)
                return;
            article.getKeywords().add(word);
            saved.add(word);
        });
        if (!saved.isEmpty())
            articleRepository.save(article);

        return Map.of("keywords", article.getKeywords().stream().toList(), "saved", saved.stream().toList());
    }

    @DeleteMapping("/{slug}/keyword/{keyword}")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void deleteKeyword(@PathVariable("slug") String slug,
            @PathVariable("keyword") String keyword) {
        if (StringUtils.isNullOrBlank(slug))
            throw new BadRequest("Slug não informado");
        if (StringUtils.isNullOrBlank(keyword))
            throw new BadRequest("Palavra-chave não informada");
        var user = userService.getCurrentAuthenticatedUserOrThrowsForbidden();
        var article = articleRepository.findBySlug(slug);
        if (article == null)
            throw new NotFound("Artigo não encontrado");
        if (articleService.cannotEdit(user, article))
            throw new Unauthorized("Usuário não tem a permissão para modificar o artigo " + slug);
        var success = article.getKeywords().removeIf(key -> key.equals(keyword));
        if (!success)
            throw new NotFound("Palavra-chave não cadastrada");
        articleRepository.save(article);
    }

    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    @PatchMapping("/{slug}/description")
    public void putDescription(@PathVariable("slug") String slug, @RequestBody Map<String, String> body) {
        if (StringUtils.isNullOrBlank(slug))
            throw new BadRequest("Slug não informado");
        var description = body.get("description");
        if (StringUtils.isNullOrBlank(description))
            throw new BadRequest("Descrição inválida ou não informada");
        var article = articleRepository.findBySlug(slug);
        if (article == null)
            throw new NotFound("Artigo não encontrado");
        if (StringUtils.isEquals(article.getDescription(), description))
            throw new Conflict("A nova descrição não pode ser igual a anterior");
        var user = userService.getCurrentAuthenticatedUserOrThrowsForbidden();
        if (articleService.cannotEdit(user, article))
            throw new Unauthorized("Usuário não tem a permissão para modificar o artigo " + slug);

        article.setDescription(description);
        articleRepository.save(article);
    }

    @PatchMapping("/{slug}/stack")
    public StackDTO putStack(@PathVariable("slug") String slug, @RequestBody Map<String, String> body) {
        if (StringUtils.isNullOrBlank(slug))
            throw new BadRequest("Slug não informado");
        var stackName = body.get("stack");
        if (StringUtils.isNullOrBlank(stackName))
            throw new BadRequest("Stack inválida ou não informada");
        var stack = stackRepository.findByName(stackName);
        if (stack == null)
            throw new NotFound(String.format("Stack %s não existe", stackName));
        var article = articleRepository.findBySlug(slug);
        if (article == null)
            throw new NotFound("Artigo não encontrado");
        var user = userService.getCurrentAuthenticatedUserOrThrowsForbidden();
        if (articleService.cannotEdit(user, article))
            throw new Unauthorized("Usuário não tem a permissão para modificar o artigo " + slug);
        var success = article.getStacks().add(stack);
        if (success)
            articleRepository.save(article);
        return stackService.toDataTransferObject(stack);
    }

    @DeleteMapping("/{slug}/stack")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void removeStack(@PathVariable("slug") String slug, @RequestBody Map<String, String> body) {
        if (StringUtils.isNullOrBlank(slug))
            throw new BadRequest("Slug não informado");
        var stackName = body.get("stack");
        if (StringUtils.isNullOrBlank(stackName))
            throw new BadRequest("Stack inválida ou não informada");

        var article = articleRepository.findBySlug(slug);
        if (article == null)
            throw new NotFound("Artigo não encontrado");
        var user = userService.getCurrentAuthenticatedUserOrThrowsForbidden();
        if (articleService.cannotEdit(user, article))
            throw new Unauthorized("Usuário não tem a permissão para modificar o artigo " + slug);
        article.getStacks().removeIf(stack -> stack.getName().equals(stackName));
        articleRepository.save(article);
    }

    @PatchMapping("/{slug}/editors")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void putEditor(@PathVariable("slug") String slug, @RequestBody Map<String, String> body) {
        if (StringUtils.isNullOrBlank(slug))
            throw new BadRequest("Slug não informado");
        var email = body.get("email");
        if (StringUtils.isNullOrBlank(email))
            throw new BadRequest("Email inválido ou não informado");
        var newEditor = userRepository.findByEmail(email);
        if (newEditor == null)
            throw new NotFound("Usuário não existe");
        if (!newEditor.isEmailChecked())
            throw new Unauthorized(String.format("Usuário %s não tem email verificado", newEditor.getEmail()));
        if (newEditor.isNonAuthor())
            throw new Unauthorized(String.format("Usuário %s não pode ser um editor", newEditor.getEmail()));
        var article = articleRepository.findBySlug(slug);
        if (article == null)
            throw new NotFound("Artigo não encontrado");
        var user = userService.getCurrentAuthenticatedUserOrThrowsForbidden();
        if (articleService.cannotEdit(user, article))
            throw new Unauthorized("Usuário não tem a permissão necessária para executar esta ação");
        article.pushEditors(newEditor);
        articleRepository.save(article);
    }

    @DeleteMapping("/{slug}/editors")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void removeEditor(@PathVariable("slug") String slug, @RequestBody Map<String, String> body) {
        if (StringUtils.isNullOrBlank(slug))
            throw new BadRequest("Slug não informado");

        var email = body.get("email");
        if (StringUtils.isNullOrBlank(email))
            throw new BadRequest("Email inválido ou não informado");

        var editorExists = userRepository.existsByEmail(email);
        if (!editorExists)
            throw new NotFound("Usuário não existe");

        var article = articleRepository.findBySlug(slug);
        if (article == null)
            throw new NotFound("Artigo não encontrado");

        var user = userService.getCurrentAuthenticatedUserOrThrowsForbidden();
        if (articleService.cannotEdit(user, article))
            throw new Unauthorized("Usuário não tem a permissão necessária para executar esta ação");

        var removed = article.getEditors().removeIf(ed -> ed.email().equals(email));
        if (removed)
            articleRepository.save(article);
    }
}
