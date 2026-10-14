package com.donaton.logistics.controller;

import com.donaton.logistics.dto.DlqReprocessResponse;
import com.donaton.logistics.service.DlqReprocessorService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/logistics/admin/dlq")
public class DlqAdminController {

    private final DlqReprocessorService dlqReprocessorService;

    public DlqAdminController(DlqReprocessorService dlqReprocessorService) {
        this.dlqReprocessorService = dlqReprocessorService;
    }

    @PostMapping("/reprocess")
    public ResponseEntity<DlqReprocessResponse> reprocess(
            @RequestParam(defaultValue = "10")
            @Min(1)
            @Max(1000)
            int limit) {
        return ResponseEntity.ok(
                dlqReprocessorService.reprocessDlqMessages(limit)
        );
    }
}
