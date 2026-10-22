package com.example.demo.service;

import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.exception.ApiException;
import com.example.demo.model.Perfil;
import com.example.demo.model.Usuario;
import com.example.demo.repository.PerfilRepository;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.security.Roles;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PerfilRepository perfilRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UsuarioRepository usuarioRepository, PerfilRepository perfilRepository,
                       PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.usuarioRepository = usuarioRepository;
        this.perfilRepository = perfilRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        // Mensaje único: no revela si el correo existe.
        Usuario u = usuarioRepository.findByCorreo(req.correo().trim())
                .filter(x -> Boolean.TRUE.equals(x.getActivo()))
                .filter(x -> x.getPassword() != null && passwordEncoder.matches(req.password(), x.getPassword()))
                .orElseThrow(() -> ApiException.unauthorized("Credenciales inválidas"));
        return toResponse(u);
    }

    /** Registro público: SIEMPRE perfil Usuario (id 3). Sin fallback a otros perfiles. */
    public AuthResponse register(RegisterRequest req) {
        String correo = req.correo().trim();
        if (usuarioRepository.existsByCorreo(correo)) {
            throw ApiException.conflict("El correo ya está registrado");
        }
        if (req.documento() != null && !req.documento().isBlank()
                && usuarioRepository.existsByDocumento(req.documento().trim())) {
            throw ApiException.conflict("El documento ya está registrado");
        }
        Perfil base = perfilRepository.findById(Roles.PERFIL_USUARIO)
                .orElseThrow(() -> new IllegalStateException("Perfil base 'Usuario' (id 3) no configurado"));
        Usuario u = new Usuario();
        u.setNombre(req.nombre().trim());
        u.setApellido(req.apellido().trim());
        u.setCorreo(correo);
        u.setPassword(passwordEncoder.encode(req.password()));
        u.setTelefono(req.telefono());
        u.setTipoDocumento(req.tipoDocumento());
        u.setDocumento(req.documento() != null && !req.documento().isBlank() ? req.documento().trim() : null);
        u.setPerfil(base);
        return toResponse(usuarioRepository.save(u));
    }

    private AuthResponse toResponse(Usuario u) {
        Long perfilId = u.getPerfil() != null ? u.getPerfil().getId() : null;
        String token = jwtUtil.generateToken(u.getId(), perfilId);
        return new AuthResponse(token, u.getId(), UsuarioService.nombreCompleto(u), u.getCorreo(), perfilId,
                Roles.authorityForPerfil(perfilId));
    }
}
