package com.donaton.needs.controller;

import com.donaton.needs.dto.NeedRequestDTO;
import com.donaton.needs.dto.NeedResponseDTO;
import com.donaton.needs.mapper.NeedMapper;
import com.donaton.needs.service.NeedService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/needs")
public class NeedController {

    private final NeedService service;

    public NeedController(NeedService service) {
        this.service = service;
    }

    @GetMapping
    public List<NeedResponseDTO> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status
    ) {
        return service.list(category, status).stream().map(NeedMapper::toResponse).toList();
    }

    @GetMapping("/{id}")
    public NeedResponseDTO get(@PathVariable String id) {
        return NeedMapper.toResponse(service.getById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NeedResponseDTO create(
            @Valid @RequestBody NeedRequestDTO request,
            @RequestHeader("X-User-Email") String email
    ) {
        return NeedMapper.toResponse(service.create(NeedMapper.toEntity(request), email));
    }

    @PutMapping("/{id}")
    public NeedResponseDTO update(
            @PathVariable String id,
            @Valid @RequestBody NeedRequestDTO request
    ) {
        return NeedMapper.toResponse(service.update(id, NeedMapper.toEntity(request)));
    }

    @PutMapping("/{id}/receive")
    public NeedResponseDTO receive(@PathVariable String id, @RequestParam Double amount) {
        return NeedMapper.toResponse(service.receive(id, amount));
    }

    @PutMapping("/{id}/rollback")
    public NeedResponseDTO rollback(@PathVariable String id, @RequestParam Double amount) {
        return NeedMapper.toResponse(service.rollbackReceive(id, amount));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
