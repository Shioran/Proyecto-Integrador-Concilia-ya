package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** acuerdo=true -> conflicto RESUELTO; acuerdo=false -> conflicto CERRADO sin acuerdo. */
public record DictamenRequest(
        @NotNull(message = "Debe indicar si hubo acuerdo") Boolean acuerdo,
        @NotBlank(message = "El detalle del dictamen es obligatorio") @Size(max = 2000) String detalle) {}
