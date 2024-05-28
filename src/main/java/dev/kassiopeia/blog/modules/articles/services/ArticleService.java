package dev.kassiopeia.blog.modules.articles.services;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import dev.kassiopeia.blog.modules.articles.DTOs.ArticleDTO;
import dev.kassiopeia.blog.modules.articles.entities.Article;
import dev.kassiopeia.blog.modules.stacks.DTOs.StackDTO;
import dev.kassiopeia.blog.modules.user.DTOs.UserDTO;
import dev.kassiopeia.blog.modules.user.entities.User;
import dev.kassiopeia.blog.modules.user.repositories.UserRepository;

@Service
public class ArticleService {
        @Autowired
        UserRepository userRepository;

        public boolean canEdit(User user, Article article) {
                return article.getEditors().stream().anyMatch(editor -> editor.id().equals(user.getId()));
        }

        public boolean cannotEdit(User user, Article article) {
                return !canEdit(user, article);
        }

        public ArticleDTO toDataTransferObject(Article art) {
                List<StackDTO> stacks = art.getStacks().stream()
                                .map(stack -> new StackDTO(stack.getName(), stack.getDescription()))
                                .collect(Collectors.toList());

                List<UserDTO> editors = art.getEditors().stream()
                                .map(editor -> userRepository.findById(editor.id()))
                                .filter(Optional::isPresent)
                                .map(Optional::get)
                                .map(User::toDataTransferObject)
                                .collect(Collectors.toList());

                return new ArticleDTO(new ArticleDTO.Links("/" + art.getSlug(), "/" + art.getSlug() + "/edit"),
                                art.getSlug(), art.getTitle(), art.getContent(),
                                art.getDescription(),
                                art.getKeywords(), stacks, editors, art.getViews(), art.getLang());
        }
}
