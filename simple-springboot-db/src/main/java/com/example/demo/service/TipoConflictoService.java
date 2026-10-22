package com.example.demo.service;

import com.example.demo.dto.TipoConflictoDto;
import com.example.demo.exception.ApiException;
import com.example.demo.model.TipoConflicto;
import com.example.demo.repository.TipoConflictoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TipoConflictoService {

    private final TipoConflictoRepository repository;

    public TipoConflictoService(TipoConflictoRepository repository) {
        this.repository = repository;
    }

    /** Los no-admin solo ven tipos activos (para registrar conflictos). */
    @Transactional(readOnly = true)
    public List<TipoConflictoDto> findAll(boolean incluirInactivos) {
        return repository.findAll().stream()
                .filter(t -> incluirInactivos || Boolean.TRUE.equals(t.getActivo()))
                .map(TipoConflictoService::toDto).toList();
    }

    @Transactional(readOnly = true)
    public TipoConflictoDto findById(Long id) {
        return toDto(buscar(id));
    }

    public TipoConflictoDto create(TipoConflictoDto dto) {
        TipoConflicto t = new TipoConflicto();
        t.setNombre(dto.nombre().trim());
        t.setDescripcion(dto.descripcion());
        t.setActivo(dto.activo() == null || dto.activo());
        return toDto(repository.save(t));
    }

    public TipoConflictoDto update(Long id, TipoConflictoDto dto) {
        TipoConflicto t = buscar(id);
        t.setNombre(dto.nombre().trim());
        t.setDescripcion(dto.descripcion());
        if (dto.activo() != null) t.setActivo(dto.activo());
        return toDto(repository.save(t));
    }

    /** Baja lógica: los conflictos existentes siguen referenciando el tipo. */
    public void delete(Long id) {
        TipoConflicto t = buscar(id);
        t.setActivo(false);
        repository.save(t);
    }

    private TipoConflicto buscar(Long id) {
        return repository.findById(id).orElseThrow(() -> ApiException.notFound("Tipo de conflicto no encontrado"));
    }

    private static TipoConflictoDto toDto(TipoConflicto t) {
        return new TipoConflictoDto(t.getId(), t.getNombre(), t.getDescripcion(), t.getActivo());
    }
}
