package com.example.demo.dto;

import java.time.LocalDateTime;

/** Nombres de campo alineados con las columnas aplanadas que usa la capa Python. */
public record ConflictoResponse(
        Long id,
        Long demandanteId, String demandanteNombre,
        Long demandadoId, String demandadoNombre,
        Long tipoConflictoId, String tipoConflictoNombre,
        Long estadoConflictoId, String estadoConflictoCodigo, String estadoConflictoNombre,
        String asunto, String descripcion, Double montoReclamado,
        LocalDateTime fechaInicio, LocalDateTime fechaCierre, String resultado,
        Boolean activo, LocalDateTime fechaAlta,
        Long mediacionId, Long mediadorId, String mediadorNombre) {}
