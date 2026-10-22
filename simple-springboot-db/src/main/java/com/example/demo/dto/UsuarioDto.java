package com.example.demo.dto;

import java.time.LocalDateTime;

/** Respuesta de usuario. Nunca incluye la contraseña. */
public record UsuarioDto(Long id, String nombre, String apellido, String tipoDocumento, String documento,
                         String correo, String telefono, Long perfilId, String perfilNombre,
                         Boolean activo, LocalDateTime fechaAlta) {}
