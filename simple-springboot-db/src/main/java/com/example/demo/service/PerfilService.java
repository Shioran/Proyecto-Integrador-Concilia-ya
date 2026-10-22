package com.example.demo.service;

import com.example.demo.dto.PerfilDto;
import com.example.demo.exception.ApiException;
import com.example.demo.model.Perfil;
import com.example.demo.repository.PerfilRepository;
import com.example.demo.security.Roles;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PerfilService {

    private final PerfilRepository repository;

    public PerfilService(PerfilRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<PerfilDto> findAll() {
        return repository.findAll().stream().map(PerfilService::toDto).toList();
    }

    @Transactional(readOnly = true)
    public PerfilDto findById(Long id) {
        return toDto(buscar(id));
    }

    public PerfilDto create(PerfilDto dto) {
        Perfil p = new Perfil();
        p.setNombre(dto.nombre().trim());
        p.setDescripcion(dto.descripcion());
        p.setActivo(dto.activo() == null || dto.activo());
        return toDto(repository.save(p));
    }

    public PerfilDto update(Long id, PerfilDto dto) {
        Perfil p = buscar(id);
        if (esBase(id) && Boolean.FALSE.equals(dto.activo())) {
            throw ApiException.conflict("Los perfiles base (Administrador, Mediador, Usuario) no pueden desactivarse");
        }
        p.setNombre(dto.nombre().trim());
        p.setDescripcion(dto.descripcion());
        if (dto.activo() != null) p.setActivo(dto.activo());
        return toDto(repository.save(p));
    }

    /** Baja lógica. Los perfiles base no se pueden eliminar. */
    public void delete(Long id) {
        Perfil p = buscar(id);
        if (esBase(id)) {
            throw ApiException.conflict("Los perfiles base (Administrador, Mediador, Usuario) no pueden eliminarse");
        }
        p.setActivo(false);
        repository.save(p);
    }

    private static boolean esBase(Long id) {
        return id == Roles.PERFIL_ADMIN || id == Roles.PERFIL_MEDIADOR || id == Roles.PERFIL_USUARIO;
    }

    private Perfil buscar(Long id) {
        return repository.findById(id).orElseThrow(() -> ApiException.notFound("Perfil no encontrado"));
    }

    private static PerfilDto toDto(Perfil p) {
        return new PerfilDto(p.getId(), p.getNombre(), p.getDescripcion(), p.getActivo());
    }
}
