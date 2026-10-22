package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.security.AuthUser;
import com.example.demo.service.MediacionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mediaciones")
public class MediacionController {

    private final MediacionService mediacionService;

    public MediacionController(MediacionService mediacionService) {
        this.mediacionService = mediacionService;
    }

    @GetMapping
    public List<MediacionResponse> getAll(@AuthenticationPrincipal AuthUser actor) {
        return mediacionService.listar(actor);
    }

    @GetMapping("/{id}")
    public MediacionResponse getById(@PathVariable Long id, @AuthenticationPrincipal AuthUser actor) {
        return mediacionService.obtener(id, actor);
    }

    /** Admin: asigna mediador; el conflicto pasa a EN_MEDIACION. */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MediacionResponse> create(@Valid @RequestBody MediacionCreateRequest request,
                                                    @AuthenticationPrincipal AuthUser actor) {
        return ResponseEntity.status(201).body(mediacionService.crear(request, actor));
    }

    /** Admin (reasignar/reprogramar) o mediador asignado (reprogramar/observaciones). */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MEDIADOR')")
    public MediacionResponse update(@PathVariable Long id, @Valid @RequestBody MediacionUpdateRequest request,
                                    @AuthenticationPrincipal AuthUser actor) {
        return mediacionService.actualizar(id, request, actor);
    }

    @GetMapping("/{id}/sesiones")
    public List<SesionResponse> sesiones(@PathVariable Long id, @AuthenticationPrincipal AuthUser actor) {
        return mediacionService.listarSesiones(id, actor);
    }

    @PostMapping("/{id}/sesiones")
    @PreAuthorize("hasRole('MEDIADOR')")
    public ResponseEntity<SesionResponse> registrarSesion(@PathVariable Long id,
                                                          @Valid @RequestBody SesionRequest request,
                                                          @AuthenticationPrincipal AuthUser actor) {
        return ResponseEntity.status(201).body(mediacionService.registrarSesion(id, request, actor));
    }

    /** Mediador asignado: RESUELTO (acuerdo=true) o CERRADO (acuerdo=false). */
    @PostMapping("/{id}/dictamen")
    @PreAuthorize("hasRole('MEDIADOR')")
    public MediacionResponse dictaminar(@PathVariable Long id, @Valid @RequestBody DictamenRequest request,
                                        @AuthenticationPrincipal AuthUser actor) {
        return mediacionService.dictaminar(id, request, actor);
    }
}
