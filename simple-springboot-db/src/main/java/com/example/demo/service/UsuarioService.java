package com.example.demo.service;

import com.example.demo.dto.UsuarioDto;
import com.example.demo.dto.UsuarioRequest;
import com.example.demo.dto.UsuarioResumenDto;
import com.example.demo.exception.ApiException;
import com.example.demo.model.Perfil;
import com.example.demo.model.Usuario;
import com.example.demo.repository.PerfilRepository;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.security.AuthUser;
import com.example.demo.security.Roles;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PerfilRepository perfilRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PerfilRepository perfilRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.perfilRepository = perfilRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public static String nombreCompleto(Usuario u) {
        return u.getNombre() + " " + u.getApellido();
    }

    public static UsuarioDto toDto(Usuario u) {
        Perfil p = u.getPerfil();
        return new UsuarioDto(u.getId(), u.getNombre(), u.getApellido(), u.getTipoDocumento(), u.getDocumento(),
                u.getCorreo(), u.getTelefono(), p != null ? p.getId() : null, p != null ? p.getNombre() : null,
                u.getActivo(), u.getFechaAlta());
    }

    @Transactional(readOnly = true)
    public List<UsuarioDto> findAll() {
        return usuarioRepository.findAll().stream().map(UsuarioService::toDto).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioDto findById(Long id) {
        return toDto(buscar(id));
    }

    @Transactional(readOnly = true)
    public UsuarioDto me(AuthUser actor) {
        return toDto(buscar(actor.id()));
    }

    /** Usuarios activos con perfil Usuario, excepto el propio: candidatos a demandado. */
    @Transactional(readOnly = true)
    public List<UsuarioResumenDto> directorio(AuthUser actor) {
        return usuarioRepository.findByPerfilIdAndActivoTrueOrderByApellidoAscNombreAsc(Roles.PERFIL_USUARIO)
                .stream().filter(u -> !u.getId().equals(actor.id()))
                .map(u -> new UsuarioResumenDto(u.getId(), nombreCompleto(u))).toList();
    }

    /** Mediadores activos: candidatos para asignar a una mediación. */
    @Transactional(readOnly = true)
    public List<UsuarioResumenDto> mediadores() {
        return usuarioRepository.findByPerfilIdAndActivoTrueOrderByApellidoAscNombreAsc(Roles.PERFIL_MEDIADOR)
                .stream().map(u -> new UsuarioResumenDto(u.getId(), nombreCompleto(u))).toList();
    }

    public UsuarioDto create(UsuarioRequest req) {
        if (req.password() == null || req.password().isBlank()) {
            throw ApiException.badRequest("La contraseña es obligatoria al crear un usuario");
        }
        if (req.perfilId() == null) {
            throw ApiException.badRequest("El perfil es obligatorio al crear un usuario");
        }
        String correo = req.correo().trim();
        if (usuarioRepository.existsByCorreo(correo)) {
            throw ApiException.conflict("El correo ya está registrado");
        }
        if (hayTexto(req.documento()) && usuarioRepository.existsByDocumento(req.documento().trim())) {
            throw ApiException.conflict("El documento ya está registrado");
        }
        Usuario u = new Usuario();
        aplicarDatos(u, req, correo);
        u.setPassword(passwordEncoder.encode(req.password()));
        u.setPerfil(buscarPerfil(req.perfilId()));
        u.setActivo(req.activo() == null || req.activo());
        return toDto(usuarioRepository.save(u));
    }

    public UsuarioDto update(Long id, UsuarioRequest req, AuthUser actor) {
        Usuario u = buscar(id);
        String correo = req.correo().trim();
        if (usuarioRepository.existsByCorreoAndIdNot(correo, id)) {
            throw ApiException.conflict("El correo ya está registrado");
        }
        if (hayTexto(req.documento()) && usuarioRepository.existsByDocumentoAndIdNot(req.documento().trim(), id)) {
            throw ApiException.conflict("El documento ya está registrado");
        }
        boolean esSiMismo = id.equals(actor.id());
        if (esSiMismo && Boolean.FALSE.equals(req.activo())) {
            throw ApiException.conflict("No puede desactivar su propia cuenta");
        }
        if (esSiMismo && req.perfilId() != null && req.perfilId() != Roles.PERFIL_ADMIN) {
            throw ApiException.conflict("No puede quitarse a sí mismo el perfil de Administrador");
        }
        aplicarDatos(u, req, correo);
        if (req.password() != null && !req.password().isBlank()) {
            u.setPassword(passwordEncoder.encode(req.password()));
        }
        if (req.perfilId() != null) u.setPerfil(buscarPerfil(req.perfilId()));
        if (req.activo() != null) u.setActivo(req.activo());
        return toDto(usuarioRepository.save(u));
    }

    /** Baja lógica (los usuarios están referenciados por conflictos, mediaciones y notificaciones). */
    public void delete(Long id, AuthUser actor) {
        Usuario u = buscar(id);
        if (id.equals(actor.id())) {
            throw ApiException.conflict("No puede desactivar su propia cuenta");
        }
        u.setActivo(false);
        usuarioRepository.save(u);
    }

    private void aplicarDatos(Usuario u, UsuarioRequest req, String correo) {
        u.setNombre(req.nombre().trim());
        u.setApellido(req.apellido().trim());
        u.setCorreo(correo);
        u.setTelefono(req.telefono());
        u.setTipoDocumento(req.tipoDocumento());
        u.setDocumento(hayTexto(req.documento()) ? req.documento().trim() : null);
    }

    private static boolean hayTexto(String s) {
        return s != null && !s.isBlank();
    }

    private Usuario buscar(Long id) {
        return usuarioRepository.findById(id).orElseThrow(() -> ApiException.notFound("Usuario no encontrado"));
    }

    private Perfil buscarPerfil(Long perfilId) {
        Perfil p = perfilRepository.findById(perfilId)
                .orElseThrow(() -> ApiException.badRequest("El perfil indicado no existe"));
        if (!Boolean.TRUE.equals(p.getActivo())) {
            throw ApiException.badRequest("El perfil indicado está inactivo");
        }
        return p;
    }
}
