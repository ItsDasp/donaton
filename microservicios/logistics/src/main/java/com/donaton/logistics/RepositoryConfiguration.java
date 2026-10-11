package com.donaton.logistics;

import com.donaton.logistics.repository.EnvioRepository;
import com.donaton.logistics.repository.EnvioRepositoryAdapter;
import com.donaton.logistics.repository.EnvioRepositoryPattern;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class RepositoryConfiguration {
    
    @Bean
    @Primary
    public EnvioRepositoryPattern envioRepositoryPattern(EnvioRepository envioRepository) {
        return new EnvioRepositoryAdapter(envioRepository);
    }
}
