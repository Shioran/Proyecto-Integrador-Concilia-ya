package com.example.demo.security;

/** Mapeo perfil.id -> rol de Spring Security. Un perfil desconocido recibe el rol mínimo (USUARIO). */
public final class Roles {
    public static final long PERFIL_ADMIN = 1L;
    public static final long PERFIL_MEDIADOR = 2L;
    public static final long PERFIL_USUARIO = 3L;

    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_MEDIADOR = "ROLE_MEDIADOR";
    public static final String ROLE_USUARIO = "ROLE_USUARIO";

    private Roles() {}

    public static String authorityForPerfil(Long perfilId) {
        if (perfilId != null && perfilId == PERFIL_ADMIN) return ROLE_ADMIN;
        if (perfilId != null && perfilId == PERFIL_MEDIADOR) return ROLE_MEDIADOR;
        return ROLE_USUARIO;
    }
}
