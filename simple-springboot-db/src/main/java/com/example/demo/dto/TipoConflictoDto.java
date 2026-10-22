package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TipoConflictoDto(Long id,
        @NotBlank(message = "El nombre es obligatorio") @Size(max = 100) String nombre,
        @Size(max = 300) String descripcion,
        Boolean activo) {}
