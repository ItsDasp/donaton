package com.bff.client;

import com.bff.dto.request.DonationRequest;
import com.bff.dto.response.DonationResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "donation-service")
public interface DonationClient {

    @GetMapping("/donations")
    List<DonationResponse> list();

    @GetMapping("/donations/{id}")
    DonationResponse get(@PathVariable("id") Long id);

    @PostMapping("/donations")
    DonationResponse create(@RequestBody DonationRequest request);

    @PutMapping("/donations/{id}")
    DonationResponse update(@PathVariable("id") Long id, @RequestBody DonationRequest request);

    @DeleteMapping("/donations/{id}")
    void delete(@PathVariable("id") Long id);
}
