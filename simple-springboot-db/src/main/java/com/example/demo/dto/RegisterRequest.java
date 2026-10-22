package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Registro público: siempre crea un usuario con perfil base (Usuario). No acepta perfilId. */
public record RegisterRequest(
        @NotBlank(message = "El nombre es obligatorio") @Size(max = 100) String nombre,
        @NotBlank(message = "El apellido es obligatorio") @Size(max = 100) String apellido,
        @NotBlank(message = "El correo es obligatorio") @Email(message = "Correo inválido") @Size(max = 120) String correo,
        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 6, max = 100, message = "La contraseña debe tener entre 6 y 100 caracteres") String password,
        @Size(max = 20) String tipoDocumento,
        @Size(max = 60) String documento,
        @Size(max = 30) String telefono) {}
