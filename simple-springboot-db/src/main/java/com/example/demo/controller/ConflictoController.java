package com.example.demo.controller;

import com.example.demo.dto.ConflictoCreateRequest;
import com.example.demo.dto.ConflictoResponse;
import com.example.demo.dto.ConflictoUpdateRequest;
import com.example.demo.security.AuthUser;
import com.example.demo.service.ConflictoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conflictos")
public class ConflictoController {

    private final ConflictoService conflictoService;

    public ConflictoController(ConflictoService conflictoService) {
        this.conflictoService = conflictoService;
    }

    @GetMapping
    public List<ConflictoResponse> getAll(@AuthenticationPrincipal AuthUser actor) {
        return conflictoService.listar(actor);
    }

    @GetMapping("/{id}")
    public ConflictoResponse getById(@PathVariable Long id, @AuthenticationPrincipal AuthUser actor) {
        return conflictoService.obtener(id, actor);
    }

    @PostMapping
    public ResponseEntity<ConflictoResponse> create(@Valid @RequestBody ConflictoCreateRequest request,
                                                    @AuthenticationPrincipal AuthUser actor) {
        return ResponseEntity.status(201).body(conflictoService.crear(request, actor));
    }

    @PutMapping("/{id}")
    public ConflictoResponse update(@PathVariable Long id, @Valid @RequestBody ConflictoUpdateRequest request,
                                    @AuthenticationPrincipal AuthUser actor) {
        return conflictoService.actualizar(id, request, actor);
    }

    /** Cancela (baja lógica) un conflicto ABIERTO. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal AuthUser actor) {
        conflictoService.cancelar(id, actor);
        return ResponseEntity.noContent().build();
    }
}
