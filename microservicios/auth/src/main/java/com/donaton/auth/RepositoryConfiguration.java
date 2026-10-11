package com.donaton.auth;

import com.donaton.auth.repository.UserRepository;
import com.donaton.auth.repository.UserRepositoryAdapter;
import com.donaton.auth.repository.UserRepositoryPattern;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class RepositoryConfiguration {
    
    @Bean
    @Primary
    public UserRepositoryPattern userRepositoryPattern(UserRepository userRepository) {
        return new UserRepositoryAdapter(userRepository);
    }
}
