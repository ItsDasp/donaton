package com.bff.client;

import com.bff.dto.request.LogisticsRequest;
import com.bff.dto.response.LogisticsResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "logistics-service")
public interface LogisticsClient {

    @GetMapping("/envios")
    List<LogisticsResponse> list(@RequestParam(required = false) String acopioCenterId);

    @PostMapping("/envios")
    LogisticsResponse create(@RequestBody LogisticsRequest request);

    @PutMapping("/envios/{id}/estado")
    LogisticsResponse updateState(
            @PathVariable("id") Long id,
            @RequestParam("estado") String estado
    );
}
