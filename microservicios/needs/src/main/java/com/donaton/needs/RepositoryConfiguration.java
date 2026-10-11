package com.donaton.needs;

import com.donaton.needs.repository.NeedRepository;
import com.donaton.needs.repository.NeedRepositoryAdapter;
import com.donaton.needs.repository.NeedRepositoryPattern;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class RepositoryConfiguration {
    
    @Bean
    @Primary
    public NeedRepositoryPattern needRepositoryPattern(NeedRepository needRepository) {
        return new NeedRepositoryAdapter(needRepository);
    }
}
