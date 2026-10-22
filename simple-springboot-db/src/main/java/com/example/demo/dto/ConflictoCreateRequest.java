package com.example.demo.dto;

import jakarta.validation.constraints.*;

/** El demandante NO se envía: se toma del token. El estado inicial siempre es ABIERTO. */
public record ConflictoCreateRequest(
        @NotNull(message = "El demandado es obligatorio") Long usuarioDemandadoId,
        @NotNull(message = "El tipo de conflicto es obligatorio") Long tipoConflictoId,
        @NotBlank(message = "El asunto es obligatorio") @Size(max = 200) String asunto,
        @Size(max = 1000) String descripcion,
        @PositiveOrZero(message = "El monto no puede ser negativo") Double montoReclamado) {}
