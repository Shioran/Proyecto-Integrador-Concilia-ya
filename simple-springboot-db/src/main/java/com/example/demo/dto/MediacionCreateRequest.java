package com.example.demo.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record MediacionCreateRequest(
        @NotNull(message = "El conflicto es obligatorio") Long conflictoId,
        @NotNull(message = "El mediador es obligatorio") Long mediadorId,
        LocalDateTime fechaProgramada,
        @Size(max = 200) String lugar) {}
