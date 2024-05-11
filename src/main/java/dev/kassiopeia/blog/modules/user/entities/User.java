package dev.kassiopeia.blog.modules.user.entities;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.aventrix.jnanoid.jnanoid.NanoIdUtils;

import dev.kassiopeia.blog.authentication.enums.AuthenticationRole;
import dev.kassiopeia.blog.data.entities.Metadata;
import dev.kassiopeia.blog.modules.user.DTOs.UserDTO;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
@EqualsAndHashCode(callSuper = false)
@Document
public class User extends Metadata implements UserDetails {
    @Setter(AccessLevel.NONE)
    private String id;
    @Indexed(unique = true)
    private String email;

    private String name;

    @Indexed(unique = true)
    private String username;

    private String bio;

    private String avatarURL;

    private String privateAvatarURL;

    private SocialMedia social = new SocialMedia("", "", "", "", "", "", "");

    private AuthenticationRole role = AuthenticationRole.COMMON;

    private String password;

    private boolean activated = true;
    private boolean locked = false;

    @Getter(AccessLevel.NONE)
    private boolean emailChecked = false;

    public User(String email, String password) {
        this.email = email;
        this.password = password;
        name = email.split("@")[0];
        username = name + '_' + NanoIdUtils.randomNanoId();
    }

    public UserDTO toDataTransferObject() {
        return new UserDTO(email, name, username, bio, avatarURL, social, listOfRoles(), emailChecked);
    }

    public List<String> listOfRoles() {
        Set<String> roles = new HashSet<>();
        switch (role) {
            case ROOT:
                roles.addAll(List.of(AuthenticationRole.ROOT.asString(),
                        AuthenticationRole.ADMIN.asString(),
                        AuthenticationRole.MODERATOR.asString(),
                        AuthenticationRole.AUTHOR.asString()));
                break;
            case ADMIN:
                roles.addAll(List.of(AuthenticationRole.ADMIN.asString(),
                        AuthenticationRole.MODERATOR.asString(),
                        AuthenticationRole.AUTHOR.asString()));
                break;
            case MODERATOR:
                roles.addAll(List.of(role.asString(), AuthenticationRole.AUTHOR.asString()));
                break;
            default:
                roles.add(role.asString());
                break;
        }
        roles.add(AuthenticationRole.COMMON.asString());
        return roles.stream().toList();
    }

    public Stream<String> streamOfRoles() {
        Set<String> roles = new HashSet<>();
        switch (role) {
            case ROOT:
                roles.addAll(List.of(AuthenticationRole.ROOT.asString(),
                        AuthenticationRole.ADMIN.asString(),
                        AuthenticationRole.MODERATOR.asString(),
                        AuthenticationRole.AUTHOR.asString()));
                break;
            case ADMIN:
                roles.addAll(List.of(AuthenticationRole.ADMIN.asString(),
                        AuthenticationRole.MODERATOR.asString(),
                        AuthenticationRole.AUTHOR.asString()));
                break;
            case MODERATOR:
                roles.addAll(List.of(role.asString(), AuthenticationRole.AUTHOR.asString()));
                break;
            default:
                roles.add(role.asString());
                break;
        }
        roles.add(AuthenticationRole.COMMON.asString());
        return roles.stream();
    }

    public boolean hasRole(AuthenticationRole role) {
        return listOfRoles().contains(role.asString());
    }

    public boolean isEmailChecked() {
        return emailChecked;
    }

    public boolean isAuthor() {
        return role != AuthenticationRole.COMMON;
    }

    public boolean isModerator() {
        return role != AuthenticationRole.COMMON && role != AuthenticationRole.AUTHOR;
    }

    public boolean isAdmin() {
        return role == AuthenticationRole.ADMIN || role == AuthenticationRole.ROOT;
    }

    public boolean isRoot() {
        return role == AuthenticationRole.ROOT;
    }

    public boolean isNonAuthor() {
        return role == AuthenticationRole.COMMON;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        var roles = new ArrayList<GrantedAuthority>();
        switch (role) {
            case ROOT:
                roles.addAll(List.of(new SimpleGrantedAuthority("ROLE_" + AuthenticationRole.ROOT.asString()),
                        new SimpleGrantedAuthority("ROLE_" + AuthenticationRole.ADMIN.asString()),
                        new SimpleGrantedAuthority("ROLE_" + AuthenticationRole.MODERATOR.asString()),
                        new SimpleGrantedAuthority("ROLE_" + AuthenticationRole.AUTHOR.asString())));
                break;
            case ADMIN:
                roles.addAll(List.of(new SimpleGrantedAuthority("ROLE_" + AuthenticationRole.ADMIN.asString()),
                        new SimpleGrantedAuthority("ROLE_" + AuthenticationRole.MODERATOR.asString()),
                        new SimpleGrantedAuthority("ROLE_" + AuthenticationRole.AUTHOR.asString())));
                break;
            case MODERATOR:
                roles.add(new SimpleGrantedAuthority("ROLE_" + role.asString()));
                roles.add(new SimpleGrantedAuthority("ROLE_" + AuthenticationRole.AUTHOR.asString()));
                break;
            default:
                roles.add(new SimpleGrantedAuthority("ROLE_" + role.asString()));
                break;
        }
        roles.add(new SimpleGrantedAuthority("ROLE_" + AuthenticationRole.COMMON.asString()));
        return roles;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !locked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return activated;
    }
}
