package com.example.demo.controller;

import com.example.demo.dto.NotificacionResponse;
import com.example.demo.security.AuthUser;
import com.example.demo.service.NotificacionService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Cada usuario solo accede a sus propias notificaciones. */
@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

    private final NotificacionService notificacionService;

    public NotificacionController(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }

    @GetMapping("/mias")
    public List<NotificacionResponse> mias(@AuthenticationPrincipal AuthUser actor) {
        return notificacionService.mias(actor.id());
    }

    @GetMapping("/mias/no-leidas/count")
    public Map<String, Long> contarNoLeidas(@AuthenticationPrincipal AuthUser actor) {
        return Map.of("count", notificacionService.contarNoLeidas(actor.id()));
    }

    @PatchMapping("/{id}/leida")
    public NotificacionResponse marcarLeida(@PathVariable Long id, @AuthenticationPrincipal AuthUser actor) {
        return notificacionService.marcarLeida(id, actor.id());
    }

    @PatchMapping("/mias/leidas")
    public Map<String, Integer> marcarTodasLeidas(@AuthenticationPrincipal AuthUser actor) {
        return Map.of("actualizadas", notificacionService.marcarTodasLeidas(actor.id()));
    }
}
