package com.bff.controller;

import com.bff.dto.request.DonationRequest;
import com.bff.dto.response.DonationResponse;
import com.bff.service.DonationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/donations")
public class DonationController {

    private final DonationService donationService;

    public DonationController(DonationService donationService) {
        this.donationService = donationService;
    }

    @GetMapping
    public List<DonationResponse> list() {
        return donationService.list();
    }

    @GetMapping("/{id}")
    public DonationResponse get(@PathVariable Long id) {
        return donationService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DonationResponse create(@Valid @RequestBody DonationRequest request) {
        return donationService.create(request);
    }

    @PutMapping("/{id}")
    public DonationResponse update(
            @PathVariable Long id,
            @Valid @RequestBody DonationRequest request
    ) {
        return donationService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        donationService.delete(id);
    }
}
