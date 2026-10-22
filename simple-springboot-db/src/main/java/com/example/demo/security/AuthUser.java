package com.example.demo.security;

/** Principal autenticado (se obtiene con @AuthenticationPrincipal). */
public record AuthUser(Long id, Long perfilId, String correo) {
    public boolean isAdmin() {
        return Roles.ROLE_ADMIN.equals(Roles.authorityForPerfil(perfilId));
    }

    public boolean isMediador() {
        return Roles.ROLE_MEDIADOR.equals(Roles.authorityForPerfil(perfilId));
    }
}
