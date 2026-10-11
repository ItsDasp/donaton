package com.donaton.logistics.controller;

import com.donaton.logistics.dto.EnvioRequestDTO;
import com.donaton.logistics.dto.EnvioResponseDTO;
import com.donaton.logistics.mapper.EnvioMapper;
import com.donaton.logistics.service.EnvioService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/envios")
public class EnvioController {

    private final EnvioService service;

    public EnvioController(EnvioService service) {
        this.service = service;
    }

    @PostMapping
    public EnvioResponseDTO crear(
            @Valid @RequestBody EnvioRequestDTO request,
            @RequestHeader("X-User-Email") String email,
            @RequestHeader("X-User-Role") String role
    ) {
        return EnvioMapper.toResponse(service.crearEnvio(request.getDonacionId(), email, role));
    }

    @GetMapping
    public List<EnvioResponseDTO> listar(
            @RequestParam(required = false) String acopioCenterId
    ) {
        return service.listar(acopioCenterId).stream().map(EnvioMapper::toResponse).toList();
    }

    @PutMapping("/{id}/estado")
    public EnvioResponseDTO actualizarEstado(
            @PathVariable Long id,
            @RequestParam String estado,
            @RequestHeader("X-User-Email") String email,
            @RequestHeader("X-User-Role") String role
    ) {
        return EnvioMapper.toResponse(service.actualizarEstado(id, estado, email, role));
    }
}
