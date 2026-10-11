package com.donaton.auth;

import com.donaton.auth.model.Role;
import com.donaton.auth.model.User;
import com.donaton.auth.repository.UserRepositoryPattern;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	@Bean
	CommandLineRunner seedTestUsers(UserRepositoryPattern userRepository, JdbcTemplate jdbcTemplate) {
		return args -> {
			ensureRoleConstraint(jdbcTemplate);
			seedUser(userRepository, "admin@donaton.test", "admin123", Role.ADMIN);
			seedUser(userRepository, "user@donaton.test", "user123", Role.USER);
			seedUser(userRepository, "ong@donaton.test", "ong123", Role.ONG);
		};
	}

	private void ensureRoleConstraint(JdbcTemplate jdbcTemplate) {
		
		
		try {
			jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
			jdbcTemplate.execute("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('USER','ADMIN','ONG'))");
		} catch (Exception ignored) {
			
		}
	}

	private void seedUser(UserRepositoryPattern userRepository, String email, String password, Role role) {
		userRepository.findByEmail(email)
				.orElseGet(() -> {
					User user = new User();
					user.setEmail(email);
					user.setPassword(password);
					user.setRole(role);
					return userRepository.save(user);
				});
	}

}
