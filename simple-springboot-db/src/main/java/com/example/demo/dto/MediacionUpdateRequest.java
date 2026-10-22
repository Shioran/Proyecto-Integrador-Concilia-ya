package com.example.demo.dto;

import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/** Actualización parcial: los campos nulos no se modifican. mediadorId solo lo puede cambiar el Admin. */
public record MediacionUpdateRequest(
        Long mediadorId,
        LocalDateTime fechaProgramada,
        @Size(max = 200) String lugar,
        @Size(max = 1000) String observaciones) {}
