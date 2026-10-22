package com.example.demo.dto;

import java.time.LocalDateTime;

public record NotificacionResponse(Long id, Long conflictoId, String mensaje, Boolean leida, LocalDateTime fecha) {}
