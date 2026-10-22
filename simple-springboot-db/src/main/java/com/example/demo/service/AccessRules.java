package com.example.demo.service;

import com.example.demo.model.Conflicto;

/** Reglas de pertenencia compartidas por los servicios. */
final class AccessRules {
    private AccessRules() {}

    static boolean esParte(Conflicto c, Long usuarioId) {
        return c.getUsuarioDemandante().getId().equals(usuarioId)
                || c.getUsuarioDemandado().getId().equals(usuarioId);
    }
}
