package com.example.demo.controller;

import com.example.demo.dto.UsuarioDto;
import com.example.demo.dto.UsuarioRequest;
import com.example.demo.dto.UsuarioResumenDto;
import com.example.demo.security.AuthUser;
import com.example.demo.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    /** Cualquier usuario autenticado: candidatos a demandado (solo id + nombre). */
    @GetMapping("/directorio")
    public List<UsuarioResumenDto> directorio(@AuthenticationPrincipal AuthUser actor) {
        return usuarioService.directorio(actor);
    }

    /** Admin: mediadores disponibles para asignar. */
    @GetMapping("/mediadores")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UsuarioResumenDto> mediadores() {
        return usuarioService.mediadores();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UsuarioDto> getAll() {
        return usuarioService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UsuarioDto getById(@PathVariable Long id) {
        return usuarioService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioDto> create(@Valid @RequestBody UsuarioRequest request) {
        return ResponseEntity.status(201).body(usuarioService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UsuarioDto update(@PathVariable Long id, @Valid @RequestBody UsuarioRequest request,
                             @AuthenticationPrincipal AuthUser actor) {
        return usuarioService.update(id, request, actor);
    }

    /** Baja lógica. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal AuthUser actor) {
        usuarioService.delete(id, actor);
        return ResponseEntity.noContent().build();
    }
}
