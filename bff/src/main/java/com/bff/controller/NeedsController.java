package com.bff.controller;

import com.bff.dto.request.NeedsRequest;
import com.bff.dto.response.NeedsResponse;
import com.bff.service.NeedsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/needs")
public class NeedsController {

    private final NeedsService needsService;

    public NeedsController(NeedsService needsService) {
        this.needsService = needsService;
    }

    @GetMapping
    public List<NeedsResponse> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status
    ) {
        return needsService.list(category, status);
    }

    @GetMapping("/{id}")
    public NeedsResponse get(@PathVariable String id) {
        return needsService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NeedsResponse create(@Valid @RequestBody NeedsRequest request) {
        return needsService.create(request);
    }

    @PutMapping("/{id}")
    public NeedsResponse update(
            @PathVariable String id,
            @Valid @RequestBody NeedsRequest request
    ) {
        return needsService.update(id, request);
    }

    @PutMapping("/{id}/receive")
    public NeedsResponse receive(
            @PathVariable String id,
            @RequestParam Double amount
    ) {
        return needsService.receive(id, amount);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        needsService.delete(id);
    }
}
