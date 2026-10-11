package com.donaton.logistics.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "logistics_envio")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogisticsEnvio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long donacionId;

    private String needId;

    
    @Column(nullable = false)
    private String direccion;

    @Column(nullable = false)
    private String acopioCenterId;

    @Column(nullable = false)
    private String acopioCenterName;

    @Column(nullable = false)
    private String estado;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant acopioDeadline;

    private Double cantidadDonada;
}
