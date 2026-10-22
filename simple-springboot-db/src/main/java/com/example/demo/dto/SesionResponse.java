package com.example.demo.dto;

import java.time.LocalDateTime;

public record SesionResponse(Long id, Long mediacionId, LocalDateTime fecha, String lugar,
                             String observaciones, LocalDateTime fechaRegistro) {}
