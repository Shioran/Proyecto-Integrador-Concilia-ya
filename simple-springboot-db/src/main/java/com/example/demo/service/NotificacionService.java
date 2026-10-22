package com.example.demo.service;

import com.example.demo.dto.NotificacionResponse;
import com.example.demo.exception.ApiException;
import com.example.demo.model.Notificacion;
import com.example.demo.model.Usuario;
import com.example.demo.repository.NotificacionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;

    public NotificacionService(NotificacionRepository notificacionRepository) {
        this.notificacionRepository = notificacionRepository;
    }

    /** Se ejecuta dentro de la transacción del llamador: si el negocio falla, la notificación no se guarda. */
    public void notificar(Usuario destinatario, String mensaje, Long conflictoId) {
        Notificacion n = new Notificacion();
        n.setUsuario(destinatario);
        n.setConflictoId(conflictoId);
        n.setMensaje(mensaje.length() > 1000 ? mensaje.substring(0, 1000) : mensaje);
        notificacionRepository.save(n);
    }

    @Transactional(readOnly = true)
    public List<NotificacionResponse> mias(Long usuarioId) {
        return notificacionRepository.findByUsuarioIdOrderByFechaDesc(usuarioId).stream()
                .map(NotificacionService::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public long contarNoLeidas(Long usuarioId) {
        return notificacionRepository.countByUsuarioIdAndLeidaFalse(usuarioId);
    }

    public NotificacionResponse marcarLeida(Long id, Long usuarioId) {
        Notificacion n = notificacionRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> ApiException.notFound("Notificación no encontrada"));
        n.setLeida(true);
        return toResponse(notificacionRepository.save(n));
    }

    public int marcarTodasLeidas(Long usuarioId) {
        return notificacionRepository.marcarTodasLeidas(usuarioId);
    }

    private static NotificacionResponse toResponse(Notificacion n) {
        return new NotificacionResponse(n.getId(), n.getConflictoId(), n.getMensaje(), n.getLeida(), n.getFecha());
    }
}
