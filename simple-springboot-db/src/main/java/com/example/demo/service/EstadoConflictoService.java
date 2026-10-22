package com.example.demo.service;

import com.example.demo.dto.EstadoConflictoDto;
import com.example.demo.exception.ApiException;
import com.example.demo.model.EstadoConflicto;
import com.example.demo.repository.EstadoConflictoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Los estados son de solo lectura: la lógica de negocio depende de sus códigos. */
@Service
@Transactional(readOnly = true)
public class EstadoConflictoService {

    private final EstadoConflictoRepository repository;

    public EstadoConflictoService(EstadoConflictoRepository repository) {
        this.repository = repository;
    }

    public List<EstadoConflictoDto> findAll() {
        return repository.findAll().stream().map(EstadoConflictoService::toDto).toList();
    }

    public EstadoConflictoDto findById(Long id) {
        return repository.findById(id).map(EstadoConflictoService::toDto)
                .orElseThrow(() -> ApiException.notFound("Estado de conflicto no encontrado"));
    }

    /** Uso interno de otros servicios. */
    EstadoConflicto entidadPorCodigo(String codigo) {
        return repository.findByCodigo(codigo)
                .orElseThrow(() -> new IllegalStateException("Estado '" + codigo + "' no está configurado en la BD"));
    }

    private static EstadoConflictoDto toDto(EstadoConflicto e) {
        return new EstadoConflictoDto(e.getId(), e.getNombre(), e.getCodigo(), e.getDescripcion(), e.getActivo());
    }
}
