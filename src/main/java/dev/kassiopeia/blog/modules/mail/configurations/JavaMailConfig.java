package dev.kassiopeia.blog.modules.mail.configurations;

import java.util.Properties;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

@Configuration
public class JavaMailConfig {

    private String host;

    private String user;

    private String password;

    private int port;

    public JavaMailConfig(@Value("${spring.mail.host}") String host, @Value("${spring.mail.username}") String user,
            @Value("${spring.mail.password}") String password, @Value("${spring.mail.port}") Integer port) {
        this.host = host;
        this.user = user;
        this.password = password;
        this.port = port;
    }

    @Bean
    JavaMailSender javaMailSender() {
        var mail = new JavaMailSenderImpl();
        mail.setHost(host);
        mail.setPort(port);
        mail.setUsername(user);
        mail.setPassword(password);

        Properties props = mail.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.ssl.trust", host);
        props.put("mail.debug", true);
        return mail;
    }
}
