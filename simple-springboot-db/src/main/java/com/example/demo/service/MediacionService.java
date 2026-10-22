package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.exception.ApiException;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import com.example.demo.security.AuthUser;
import com.example.demo.security.Roles;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Flujo: ABIERTO --(Admin asigna mediador)--> EN_MEDIACION --(Mediador dictamina)--> RESUELTO | CERRADO.
 * El estado vive únicamente en Conflicto; Mediacion.activo indica "en curso".
 */
@Service
@Transactional
public class MediacionService {

    public static final String RESULTADO_ACUERDO = "ACUERDO";
    public static final String RESULTADO_SIN_ACUERDO = "SIN_ACUERDO";
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final MediacionRepository mediacionRepository;
    private final SesionMediacionRepository sesionRepository;
    private final ConflictoRepository conflictoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EstadoConflictoService estadoService;
    private final NotificacionService notificacionService;

    public MediacionService(MediacionRepository mediacionRepository, SesionMediacionRepository sesionRepository,
                            ConflictoRepository conflictoRepository, UsuarioRepository usuarioRepository,
                            EstadoConflictoService estadoService, NotificacionService notificacionService) {
        this.mediacionRepository = mediacionRepository;
        this.sesionRepository = sesionRepository;
        this.conflictoRepository = conflictoRepository;
        this.usuarioRepository = usuarioRepository;
        this.estadoService = estadoService;
        this.notificacionService = notificacionService;
    }

    // ------------------------------------------------------------------ consultas

    @Transactional(readOnly = true)
    public List<MediacionResponse> listar(AuthUser actor) {
        List<Mediacion> lista;
        if (actor.isAdmin()) lista = mediacionRepository.findAllByOrderByIdDesc();
        else if (actor.isMediador()) lista = mediacionRepository.findByUsuarioMediadorIdOrderByIdDesc(actor.id());
        else lista = mediacionRepository.findByParte(actor.id());
        return lista.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public MediacionResponse obtener(Long id, AuthUser actor) {
        Mediacion m = buscar(id);
        verificarAcceso(m, actor);
        return toResponse(m);
    }

    @Transactional(readOnly = true)
    public List<SesionResponse> listarSesiones(Long mediacionId, AuthUser actor) {
        Mediacion m = buscar(mediacionId);
        verificarAcceso(m, actor);
        return sesionRepository.findByMediacionIdOrderByFechaAsc(mediacionId).stream()
                .map(MediacionService::toSesionResponse).toList();
    }

    // ------------------------------------------------------------------ comandos

    /** Regla 2 (Admin): asigna mediador, crea la mediación y el conflicto pasa a EN_MEDIACION. */
    public MediacionResponse crear(MediacionCreateRequest req, AuthUser actor) {
        // Bloqueo pesimista: serializa asignaciones concurrentes sobre el mismo conflicto.
        Conflicto c = conflictoRepository.findByIdForUpdate(req.conflictoId())
                .orElseThrow(() -> ApiException.notFound("Conflicto no encontrado"));
        if (!Boolean.TRUE.equals(c.getActivo())) {
            throw ApiException.conflict("El conflicto fue cancelado");
        }
        if (!EstadoCodigo.ABIERTO.equals(c.getEstadoConflicto().getCodigo())
                || mediacionRepository.existsByConflictoIdAndActivoTrue(c.getId())) {
            throw ApiException.conflict("El conflicto ya tiene una mediación en curso o ya fue concluido");
        }
        Usuario mediador = validarMediador(req.mediadorId(), c);

        Mediacion m = new Mediacion();
        m.setConflicto(c);
        m.setUsuarioMediador(mediador);
        m.setFechaProgramada(req.fechaProgramada());
        m.setLugar(req.lugar());
        m = mediacionRepository.save(m);

        c.setEstadoConflicto(estadoService.entidadPorCodigo(EstadoCodigo.EN_MEDIACION));
        conflictoRepository.save(c);

        String med = UsuarioService.nombreCompleto(mediador);
        notificarPartes(c, "Se asignó al mediador " + med + " para su conflicto «" + c.getAsunto()
                + "». El conflicto pasó a EN MEDIACIÓN." + programacion(m));
        notificacionService.notificar(mediador,
                "Se le asignó la mediación del conflicto «" + c.getAsunto() + "»." + programacion(m), c.getId());
        return toResponse(m);
    }

    /** Admin: reasigna mediador / reprograma. Mediador asignado: reprograma y registra observaciones. */
    public MediacionResponse actualizar(Long id, MediacionUpdateRequest req, AuthUser actor) {
        Mediacion m = buscar(id);
        if (!Boolean.TRUE.equals(m.getActivo())) {
            throw ApiException.conflict("La mediación ya concluyó y no puede modificarse");
        }
        boolean esMediadorAsignado = m.getUsuarioMediador().getId().equals(actor.id());
        if (!actor.isAdmin() && !esMediadorAsignado) {
            throw ApiException.forbidden("Solo el administrador o el mediador asignado pueden modificar la mediación");
        }
        if (req.observaciones() != null) {
            if (!esMediadorAsignado) {
                throw ApiException.forbidden("Solo el mediador asignado puede registrar observaciones");
            }
            m.setObservaciones(req.observaciones());
        }
        Conflicto c = m.getConflicto();
        if (req.mediadorId() != null && !req.mediadorId().equals(m.getUsuarioMediador().getId())) {
            if (!actor.isAdmin()) {
                throw ApiException.forbidden("Solo un administrador puede reasignar el mediador");
            }
            Usuario nuevo = validarMediador(req.mediadorId(), c);
            m.setUsuarioMediador(nuevo);
            notificacionService.notificar(nuevo,
                    "Se le asignó la mediación del conflicto «" + c.getAsunto() + "».", c.getId());
            notificarPartes(c, "El mediador de su conflicto «" + c.getAsunto() + "» ahora es "
                    + UsuarioService.nombreCompleto(nuevo) + ".");
        }
        boolean reprogramada = false;
        if (req.fechaProgramada() != null && !req.fechaProgramada().equals(m.getFechaProgramada())) {
            m.setFechaProgramada(req.fechaProgramada());
            reprogramada = true;
        }
        if (req.lugar() != null && !req.lugar().equals(m.getLugar())) {
            m.setLugar(req.lugar());
            reprogramada = true;
        }
        m = mediacionRepository.save(m);
        if (reprogramada) {
            notificarPartes(c, "La mediación de su conflicto «" + c.getAsunto() + "» fue reprogramada."
                    + programacion(m));
        }
        return toResponse(m);
    }

    /** Regla 3 (Mediador asignado): registra una sesión. */
    public SesionResponse registrarSesion(Long mediacionId, SesionRequest req, AuthUser actor) {
        Mediacion m = buscar(mediacionId);
        exigirMediadorAsignado(m, actor);
        if (!Boolean.TRUE.equals(m.getActivo())) {
            throw ApiException.conflict("La mediación ya concluyó: no se pueden registrar más sesiones");
        }
        SesionMediacion s = new SesionMediacion();
        s.setMediacion(m);
        s.setFecha(req.fecha());
        s.setLugar(req.lugar());
        s.setObservaciones(req.observaciones());
        s = sesionRepository.save(s);

        Conflicto c = m.getConflicto();
        notificarPartes(c, "Se registró una sesión de mediación del " + req.fecha().format(FMT)
                + " para su conflicto «" + c.getAsunto() + "».");
        return toSesionResponse(s);
    }

    /**
     * Regla 3-4 (Mediador asignado): dictamina. acuerdo -> RESUELTO; sin acuerdo -> CERRADO.
     * Actualiza Mediacion y Conflicto en la misma transacción y notifica a demandante y demandado.
     */
    public MediacionResponse dictaminar(Long mediacionId, DictamenRequest req, AuthUser actor) {
        Mediacion m = buscar(mediacionId);
        exigirMediadorAsignado(m, actor);
        Conflicto c = conflictoRepository.findByIdForUpdate(m.getConflicto().getId())
                .orElseThrow(() -> ApiException.notFound("Conflicto no encontrado"));
        if (!Boolean.TRUE.equals(m.getActivo())
                || !EstadoCodigo.EN_MEDIACION.equals(c.getEstadoConflicto().getCodigo())) {
            throw ApiException.conflict("La mediación ya fue dictaminada");
        }
        boolean acuerdo = Boolean.TRUE.equals(req.acuerdo());
        String resultado = acuerdo ? RESULTADO_ACUERDO : RESULTADO_SIN_ACUERDO;
        LocalDateTime ahora = LocalDateTime.now();

        m.setResultado(resultado);
        m.setDictamen(req.detalle());
        m.setFechaCierre(ahora);
        m.setActivo(false);
        m = mediacionRepository.save(m);

        EstadoConflicto estadoFinal = estadoService.entidadPorCodigo(
                acuerdo ? EstadoCodigo.RESUELTO : EstadoCodigo.CERRADO);
        c.setEstadoConflicto(estadoFinal);
        c.setResultado(resultado);
        c.setFechaCierre(ahora);
        conflictoRepository.save(c);

        notificarPartes(c, "La mediación de su conflicto «" + c.getAsunto() + "» concluyó "
                + (acuerdo ? "CON acuerdo (estado: RESUELTO)." : "SIN acuerdo (estado: CERRADO).")
                + " Dictamen: " + req.detalle());
        return toResponse(m);
    }

    // ------------------------------------------------------------------ helpers

    private Usuario validarMediador(Long mediadorId, Conflicto c) {
        Usuario u = usuarioRepository.findById(mediadorId)
                .orElseThrow(() -> ApiException.badRequest("El mediador indicado no existe"));
        if (!Boolean.TRUE.equals(u.getActivo())) {
            throw ApiException.badRequest("El mediador indicado está inactivo");
        }
        if (u.getPerfil() == null || u.getPerfil().getId() != Roles.PERFIL_MEDIADOR) {
            throw ApiException.badRequest("El usuario indicado no tiene perfil de Mediador");
        }
        if (AccessRules.esParte(c, u.getId())) {
            throw ApiException.conflict("El mediador no puede ser parte del conflicto (conflicto de interés)");
        }
        return u;
    }

    private void exigirMediadorAsignado(Mediacion m, AuthUser actor) {
        if (!m.getUsuarioMediador().getId().equals(actor.id())) {
            throw ApiException.forbidden("Solo el mediador asignado puede realizar esta operación");
        }
    }

    private void verificarAcceso(Mediacion m, AuthUser actor) {
        if (actor.isAdmin()) return;
        if (m.getUsuarioMediador().getId().equals(actor.id())) return;
        if (AccessRules.esParte(m.getConflicto(), actor.id())) return;
        throw ApiException.forbidden("No tiene acceso a esta mediación");
    }

    private Mediacion buscar(Long id) {
        return mediacionRepository.findById(id).orElseThrow(() -> ApiException.notFound("Mediación no encontrada"));
    }

    private void notificarPartes(Conflicto c, String mensaje) {
        notificacionService.notificar(c.getUsuarioDemandante(), mensaje, c.getId());
        notificacionService.notificar(c.getUsuarioDemandado(), mensaje, c.getId());
    }

    private static String programacion(Mediacion m) {
        StringBuilder sb = new StringBuilder();
        if (m.getFechaProgramada() != null) sb.append(" Fecha: ").append(m.getFechaProgramada().format(FMT)).append('.');
        if (m.getLugar() != null && !m.getLugar().isBlank()) sb.append(" Lugar: ").append(m.getLugar()).append('.');
        return sb.toString();
    }

    private static SesionResponse toSesionResponse(SesionMediacion s) {
        return new SesionResponse(s.getId(), s.getMediacion().getId(), s.getFecha(), s.getLugar(),
                s.getObservaciones(), s.getFechaRegistro());
    }

    private MediacionResponse toResponse(Mediacion m) {
        Conflicto c = m.getConflicto();
        Usuario dte = c.getUsuarioDemandante();
        Usuario ddo = c.getUsuarioDemandado();
        Usuario med = m.getUsuarioMediador();
        EstadoConflicto e = c.getEstadoConflicto();
        return new MediacionResponse(m.getId(), c.getId(), c.getAsunto(),
                dte.getId(), UsuarioService.nombreCompleto(dte),
                ddo.getId(), UsuarioService.nombreCompleto(ddo),
                med.getId(), UsuarioService.nombreCompleto(med),
                e.getCodigo(), e.getNombre(),
                m.getFechaProgramada(), m.getLugar(), m.getObservaciones(),
                m.getResultado(), m.getDictamen(),
                m.getFechaRegistro(), m.getFechaCierre(), m.getActivo());
    }
}
