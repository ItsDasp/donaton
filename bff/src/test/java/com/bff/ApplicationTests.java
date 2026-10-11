package com.bff;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE, properties = {
    "spring.cloud.discovery.enabled=false",
    "spring.cloud.openfeign.circuitbreaker.enabled=false",
    "spring.cloud.openfeign.client.config.auth-service.url=http://localhost:8081",
    "spring.cloud.openfeign.client.config.donation-service.url=http://localhost:8082",
    "spring.cloud.openfeign.client.config.logistics-service.url=http://localhost:8083",
    "spring.cloud.openfeign.client.config.needs-service.url=http://localhost:8084"
})
class ApplicationTests {

	@Test
	void contextLoads() {
		assertTrue(true);
	}
}
