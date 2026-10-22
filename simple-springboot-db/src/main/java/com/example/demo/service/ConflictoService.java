package com.example.demo.service;

import com.example.demo.dto.ConflictoCreateRequest;
import com.example.demo.dto.ConflictoResponse;
import com.example.demo.dto.ConflictoUpdateRequest;
import com.example.demo.exception.ApiException;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import com.example.demo.security.AuthUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ConflictoService {

    private final ConflictoRepository conflictoRepository;
    private final UsuarioRepository usuarioRepository;
    private final TipoConflictoRepository tipoConflictoRepository;
    private final MediacionRepository mediacionRepository;
    private final EstadoConflictoService estadoService;
    private final NotificacionService notificacionService;

    public ConflictoService(ConflictoRepository conflictoRepository, UsuarioRepository usuarioRepository,
                            TipoConflictoRepository tipoConflictoRepository, MediacionRepository mediacionRepository,
                            EstadoConflictoService estadoService, NotificacionService notificacionService) {
        this.conflictoRepository = conflictoRepository;
        this.usuarioRepository = usuarioRepository;
        this.tipoConflictoRepository = tipoConflictoRepository;
        this.mediacionRepository = mediacionRepository;
        this.estadoService = estadoService;
        this.notificacionService = notificacionService;
    }

    /** Admin: todos (incluye cancelados). Resto: los propios (como parte) y, si es mediador, los asignados. */
    @Transactional(readOnly = true)
    public List<ConflictoResponse> listar(AuthUser actor) {
        List<Conflicto> lista;
        if (actor.isAdmin()) {
            lista = conflictoRepository.findAllByOrderByFechaInicioDesc();
        } else {
            Map<Long, Conflicto> unicos = new LinkedHashMap<>();
            conflictoRepository.findVisiblesParaParte(actor.id()).forEach(c -> unicos.put(c.getId(), c));
            if (actor.isMediador()) {
                conflictoRepository.findVisiblesParaMediador(actor.id()).forEach(c -> unicos.put(c.getId(), c));
            }
            lista = unicos.values().stream()
                    .sorted(Comparator.comparing(Conflicto::getFechaInicio).reversed()).toList();
        }
        return lista.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ConflictoResponse obtener(Long id, AuthUser actor) {
        Conflicto c = buscar(id);
        verificarAcceso(c, actor);
        return toResponse(c);
    }

    /** Regla 1: un usuario registra un conflicto contra otro. Estado inicial ABIERTO. */
    public ConflictoResponse crear(ConflictoCreateRequest req, AuthUser actor) {
        Usuario demandante = usuarioRepository.findById(actor.id())
                .orElseThrow(() -> ApiException.unauthorized("Usuario autenticado no encontrado"));
        if (req.usuarioDemandadoId().equals(actor.id())) {
            throw ApiException.badRequest("No puede registrar un conflicto contra sí mismo");
        }
        Usuario demandado = usuarioRepository.findById(req.usuarioDemandadoId())
                .orElseThrow(() -> ApiException.notFound("El usuario demandado no existe"));
        if (!Boolean.TRUE.equals(demandado.getActivo())) {
            throw ApiException.badRequest("El usuario demandado está inactivo");
        }
        TipoConflicto tipo = tipoActivo(req.tipoConflictoId());

        Conflicto c = new Conflicto();
        c.setUsuarioDemandante(demandante);
        c.setUsuarioDemandado(demandado);
        c.setTipoConflicto(tipo);
        c.setEstadoConflicto(estadoService.entidadPorCodigo(EstadoCodigo.ABIERTO));
        c.setAsunto(req.asunto().trim());
        c.setDescripcion(req.descripcion());
        c.setMontoReclamado(req.montoReclamado());
        c = conflictoRepository.save(c);

        notificacionService.notificar(demandado,
                UsuarioService.nombreCompleto(demandante) + " registró un conflicto en su contra: «"
                        + c.getAsunto() + "». Un administrador asignará un mediador.", c.getId());
        return toResponse(c);
    }

    /** Solo mientras esté ABIERTO y sin mediador. El estado nunca se edita desde el cliente. */
    public ConflictoResponse actualizar(Long id, ConflictoUpdateRequest req, AuthUser actor) {
        Conflicto c = buscar(id);
        exigirEditable(c, actor, "modificar");
        c.setTipoConflicto(tipoActivo(req.tipoConflictoId()));
        c.setAsunto(req.asunto().trim());
        c.setDescripcion(req.descripcion());
        c.setMontoReclamado(req.montoReclamado());
        return toResponse(conflictoRepository.save(c));
    }

    /** Baja lógica ("retirar" el conflicto): solo ABIERTO. */
    public void cancelar(Long id, AuthUser actor) {
        Conflicto c = buscar(id);
        exigirEditable(c, actor, "cancelar");
        c.setActivo(false);
        conflictoRepository.save(c);
        notificacionService.notificar(c.getUsuarioDemandado(),
                "El conflicto «" + c.getAsunto() + "» fue retirado por el demandante.", c.getId());
    }

    // ---------------------------------------------------------------- helpers

    private void exigirEditable(Conflicto c, AuthUser actor, String accion) {
        boolean esDemandante = c.getUsuarioDemandante().getId().equals(actor.id());
        if (!actor.isAdmin() && !esDemandante) {
            throw ApiException.forbidden("Solo el demandante o un administrador puede " + accion + " el conflicto");
        }
        if (!Boolean.TRUE.equals(c.getActivo())) {
            throw ApiException.conflict("El conflicto ya fue cancelado");
        }
        if (!EstadoCodigo.ABIERTO.equals(c.getEstadoConflicto().getCodigo())) {
            throw ApiException.conflict("Solo se puede " + accion + " un conflicto en estado ABIERTO");
        }
    }

    private void verificarAcceso(Conflicto c, AuthUser actor) {
        if (actor.isAdmin()) return;
        if (!Boolean.TRUE.equals(c.getActivo())) throw ApiException.notFound("Conflicto no encontrado");
        if (AccessRules.esParte(c, actor.id())) return;
        if (actor.isMediador()
                && mediacionRepository.existsByConflictoIdAndUsuarioMediadorId(c.getId(), actor.id())) return;
        throw ApiException.forbidden("No tiene acceso a este conflicto");
    }

    private Conflicto buscar(Long id) {
        return conflictoRepository.findById(id).orElseThrow(() -> ApiException.notFound("Conflicto no encontrado"));
    }

    private TipoConflicto tipoActivo(Long tipoId) {
        TipoConflicto t = tipoConflictoRepository.findById(tipoId)
                .orElseThrow(() -> ApiException.badRequest("El tipo de conflicto no existe"));
        if (!Boolean.TRUE.equals(t.getActivo())) {
            throw ApiException.badRequest("El tipo de conflicto está inactivo");
        }
        return t;
    }

    private ConflictoResponse toResponse(Conflicto c) {
        Usuario dte = c.getUsuarioDemandante();
        Usuario ddo = c.getUsuarioDemandado();
        TipoConflicto t = c.getTipoConflicto();
        EstadoConflicto e = c.getEstadoConflicto();
        Mediacion m = mediacionRepository.findFirstByConflictoIdOrderByIdDesc(c.getId()).orElse(null);
        Usuario med = m != null ? m.getUsuarioMediador() : null;
        return new ConflictoResponse(c.getId(),
                dte.getId(), UsuarioService.nombreCompleto(dte),
                ddo.getId(), UsuarioService.nombreCompleto(ddo),
                t.getId(), t.getNombre(),
                e.getId(), e.getCodigo(), e.getNombre(),
                c.getAsunto(), c.getDescripcion(), c.getMontoReclamado(),
                c.getFechaInicio(), c.getFechaCierre(), c.getResultado(),
                c.getActivo(), c.getFechaAlta(),
                m != null ? m.getId() : null,
                med != null ? med.getId() : null,
                med != null ? UsuarioService.nombreCompleto(med) : null);
    }
}
