package com.example.demo.dto;

import java.time.LocalDateTime;

/** estadoNombre/estadoCodigo = estado del conflicto asociado (única fuente de verdad). */
public record MediacionResponse(
        Long id, Long conflictoId, String conflictoAsunto,
        Long demandanteId, String demandanteNombre,
        Long demandadoId, String demandadoNombre,
        Long mediadorId, String mediadorNombre,
        String estadoCodigo, String estadoNombre,
        LocalDateTime fechaProgramada, String lugar, String observaciones,
        String resultado, String dictamen,
        LocalDateTime fechaRegistro, LocalDateTime fechaCierre, Boolean activo) {}
