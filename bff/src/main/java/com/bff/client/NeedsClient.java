package com.bff.client;

import com.bff.dto.request.NeedsRequest;
import com.bff.dto.response.NeedsResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "needs-service")
public interface NeedsClient {

    @GetMapping("/needs")
    List<NeedsResponse> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status
    );

    @GetMapping("/needs/{id}")
    NeedsResponse get(@PathVariable("id") String id);

    @PostMapping("/needs")
    NeedsResponse create(@RequestBody NeedsRequest request);

    @PutMapping("/needs/{id}")
    NeedsResponse update(@PathVariable("id") String id, @RequestBody NeedsRequest request);

    @PutMapping("/needs/{id}/receive")
    NeedsResponse receive(@PathVariable("id") String id, @RequestParam("amount") Double amount);

    @DeleteMapping("/needs/{id}")
    void delete(@PathVariable("id") String id);
}
