package com.donaton.donation;

import com.donaton.donation.repository.DonationRepository;
import com.donaton.donation.repository.DonationRepositoryAdapter;
import com.donaton.donation.repository.DonationRepositoryPattern;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class RepositoryConfiguration {
    
    @Bean
    @Primary
    public DonationRepositoryPattern donationRepositoryPattern(DonationRepository donationRepository) {
        return new DonationRepositoryAdapter(donationRepository);
    }
}
