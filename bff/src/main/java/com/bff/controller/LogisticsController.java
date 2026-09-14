package com.bff.controller;

import com.bff.dto.request.LogisticsRequest;
import com.bff.dto.response.LogisticsResponse;
import com.bff.service.LogisticsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/logistics")
public class LogisticsController {

    private final LogisticsService logisticsService;

    public LogisticsController(LogisticsService logisticsService) {
        this.logisticsService = logisticsService;
    }

    @GetMapping
    public List<LogisticsResponse> list(
            @RequestParam(required = false) String acopioCenterId
    ) {
        return logisticsService.list(acopioCenterId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LogisticsResponse create(@Valid @RequestBody LogisticsRequest request) {
        return logisticsService.create(request);
    }

    @PutMapping("/{id}/estado")
    public LogisticsResponse updateState(
            @PathVariable Long id,
            @RequestParam String estado
    ) {
        return logisticsService.updateState(id, estado);
    }
}
