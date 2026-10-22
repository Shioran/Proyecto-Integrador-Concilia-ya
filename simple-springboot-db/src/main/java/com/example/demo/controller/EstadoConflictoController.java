package com.example.demo.controller;

import com.example.demo.dto.EstadoConflictoDto;
import com.example.demo.service.EstadoConflictoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Solo lectura: los estados son parte del modelo de negocio, no se administran. */
@RestController
@RequestMapping("/api/estados-conflicto")
public class EstadoConflictoController {

    private final EstadoConflictoService service;

    public EstadoConflictoController(EstadoConflictoService service) {
        this.service = service;
    }

    @GetMapping
    public List<EstadoConflictoDto> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public EstadoConflictoDto getById(@PathVariable Long id) { return service.findById(id); }
}
