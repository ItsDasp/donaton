package com.bff.service;

import com.bff.client.DonationClient;
import com.bff.dto.request.DonationRequest;
import com.bff.dto.response.DonationResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.logging.Logger;

@Service
public class DonationService {

    private static final Logger logger =
            Logger.getLogger(DonationService.class.getName());

    private final DonationClient donationClient;

    public DonationService(DonationClient donationClient) {
        this.donationClient = donationClient;
    }

    public List<DonationResponse> list() {
        return donationClient.list();
    }

    public DonationResponse get(Long id) {
        return donationClient.get(id);
    }

    public DonationResponse create(DonationRequest request) {
        logger.info("Creando donación para necesidad: " + request.getNeedId());

        DonationResponse donation = donationClient.create(request);

        logger.info("Donación creada exitosamente con ID: " + donation.getId());

        return donation;
    }

    public DonationResponse update(Long id, DonationRequest request) {
        return donationClient.update(id, request);
    }

    public void delete(Long id) {
        donationClient.delete(id);
    }
}