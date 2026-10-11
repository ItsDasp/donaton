package com.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class ApplicationTests {

    @Test
    void contextLoads() {
        // Notita: Diego, este archivo es parte de la culpa de pq tus builds fallaban xd
				// la otra esta en: src/test/resources/, no existia, ni tenias application-test.properties a pesar de que lo pide
    }

}