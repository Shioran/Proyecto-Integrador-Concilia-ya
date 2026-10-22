package com.example.demo.controller;

import com.example.demo.dto.PerfilDto;
import com.example.demo.service.PerfilService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/perfiles")
@PreAuthorize("hasRole('ADMIN')")
public class PerfilController {

    private final PerfilService perfilService;

    public PerfilController(PerfilService perfilService) {
        this.perfilService = perfilService;
    }

    @GetMapping
    public List<PerfilDto> getAll() { return perfilService.findAll(); }

    @GetMapping("/{id}")
    public PerfilDto getById(@PathVariable Long id) { return perfilService.findById(id); }

    @PostMapping
    public ResponseEntity<PerfilDto> create(@Valid @RequestBody PerfilDto dto) {
        return ResponseEntity.status(201).body(perfilService.create(dto));
    }

    @PutMapping("/{id}")
    public PerfilDto update(@PathVariable Long id, @Valid @RequestBody PerfilDto dto) {
        return perfilService.update(id, dto);
    }

    /** Baja lógica; los perfiles base no se pueden eliminar. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        perfilService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
