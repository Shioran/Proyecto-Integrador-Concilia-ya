package com.example.demo.security;

import com.example.demo.model.Usuario;
import com.example.demo.repository.UsuarioRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Valida el Bearer token y reconstruye la identidad desde la BD (perfil y estado "activo" vigentes).
 * NO es un @Component a propósito: se instancia en SecurityConfig para que no se registre dos veces.
 */
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthFilter(JwtUtil jwtUtil, UsuarioRepository usuarioRepository) {
        this.jwtUtil = jwtUtil;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try {
                Claims claims = jwtUtil.validateToken(header.substring(7));
                Long userId = Long.parseLong(claims.getSubject());
                Usuario u = usuarioRepository.findById(userId).orElse(null);
                if (u != null && Boolean.TRUE.equals(u.getActivo())) {
                    Long perfilId = u.getPerfil() != null ? u.getPerfil().getId() : null;
                    AuthUser principal = new AuthUser(u.getId(), perfilId, u.getCorreo());
                    var auth = new UsernamePasswordAuthenticationToken(principal, null,
                            List.of(new SimpleGrantedAuthority(Roles.authorityForPerfil(perfilId))));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception ignored) {
                SecurityContextHolder.clearContext(); // token inválido: se responde 401 más adelante
            }
        }
        chain.doFilter(request, response);
    }
}
