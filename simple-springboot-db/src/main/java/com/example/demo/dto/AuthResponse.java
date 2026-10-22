package com.example.demo.dto;

public record AuthResponse(String token, Long id, String nombre, String correo, Long perfilId, String rol) {}
