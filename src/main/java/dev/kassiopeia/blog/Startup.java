package dev.kassiopeia.blog;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@EnableMongoAuditing
@SpringBootApplication
public class Startup {
	@Value("${server.port}")
	int port;

	@EventListener(ApplicationReadyEvent.class)
	public void onStart() {
		System.out.println("\nApplication watch http://127.0.0.1:" + port + "\n");
	}

	public static void main(String[] args) {
		SpringApplication.run(Startup.class, args);
	}

}
