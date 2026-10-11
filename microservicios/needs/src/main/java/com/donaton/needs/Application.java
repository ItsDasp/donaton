package com.donaton.needs;

import com.donaton.needs.model.NeedEntity;
import com.donaton.needs.repository.NeedRepositoryPattern;
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
	CommandLineRunner seedNeeds(NeedRepositoryPattern repository) {
		return args -> {
			if (repository.count() > 0) return;

			repository.save(buildNeed(
					"agua",
					"Agua embotellada 1.5L",
					"Av. Providencia 1234, Providencia, RM",
					5000.0,
					3200.0,
					"litros",
					"alta",
					"activa",
					"Metropolitana",
					"c2",
					"Centro Acopio Providencia",
					"Urgente por corte de suministro en sector oriente"
			));

			repository.save(buildNeed(
					"alimentos",
					"Leche en polvo",
					"Av. Irarrázaval 2500, Ñuñoa, RM",
					800.0,
					400.0,
					"kg",
					"alta",
					"activa",
					"Metropolitana",
					"c1",
					"Centro Acopio Ñuñoa",
					"Para familias con lactantes"
			));

			repository.save(buildNeed(
					"medicamentos",
					"Paracetamol 500mg",
					"O'Higgins 850, Concepción, Biobío",
					300.0,
					200.0,
					"cajas",
					"alta",
					"en_proceso",
					"Biobío",
					"c3",
					"Centro Acopio Concepción",
					"Medicamentos básicos para primeros auxilios"
			));
		};
	}

	private NeedEntity buildNeed(
			String category,
			String productName,
			String address,
			Double quantityRequired,
			Double quantityReceived,
			String unit,
			String priority,
			String status,
			String region,
			String centerId,
			String centerName,
			String description
	) {
		NeedEntity n = new NeedEntity();
		n.setCategory(category);
		n.setProductName(productName);
		n.setAddress(address);
		n.setQuantityRequired(quantityRequired);
		n.setQuantityReceived(quantityReceived);
		n.setUnit(unit);
		n.setPriority(priority);
		n.setStatus(status);
		n.setRegion(region);
		n.setCenterId(centerId);
		n.setCenterName(centerName);
		n.setDescription(description);
		n.setVerifiedBy("seed");
		n.setMatchedDonations(0);
		return n;
	}

}
