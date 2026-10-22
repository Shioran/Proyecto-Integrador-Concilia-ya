package com.example.demo.controller;

import com.example.demo.dto.TipoConflictoDto;
import com.example.demo.security.AuthUser;
import com.example.demo.service.TipoConflictoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipos-conflicto")
public class TipoConflictoController {

    private final TipoConflictoService service;

    public TipoConflictoController(TipoConflictoService service) {
        this.service = service;
    }

    /** Autenticados: tipos activos. Admin: todos. */
    @GetMapping
    public List<TipoConflictoDto> getAll(@AuthenticationPrincipal AuthUser actor) {
        return service.findAll(actor.isAdmin());
    }

    @GetMapping("/{id}")
    public TipoConflictoDto getById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TipoConflictoDto> create(@Valid @RequestBody TipoConflictoDto dto) {
        return ResponseEntity.status(201).body(service.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public TipoConflictoDto update(@PathVariable Long id, @Valid @RequestBody TipoConflictoDto dto) {
        return service.update(id, dto);
    }

    /** Baja lógica. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
