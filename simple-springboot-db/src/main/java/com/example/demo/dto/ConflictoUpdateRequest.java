package com.example.demo.dto;

import jakarta.validation.constraints.*;

public record ConflictoUpdateRequest(
        @NotNull(message = "El tipo de conflicto es obligatorio") Long tipoConflictoId,
        @NotBlank(message = "El asunto es obligatorio") @Size(max = 200) String asunto,
        @Size(max = 1000) String descripcion,
        @PositiveOrZero(message = "El monto no puede ser negativo") Double montoReclamado) {}
