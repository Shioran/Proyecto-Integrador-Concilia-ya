package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record SesionRequest(
        @NotNull(message = "La fecha de la sesión es obligatoria") LocalDateTime fecha,
        @Size(max = 200) String lugar,
        @NotBlank(message = "Las observaciones son obligatorias") @Size(max = 2000) String observaciones) {}
