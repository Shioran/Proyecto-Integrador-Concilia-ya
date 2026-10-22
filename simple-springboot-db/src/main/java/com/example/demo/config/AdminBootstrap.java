package com.example.demo.config;

import com.example.demo.model.Perfil;
import com.example.demo.model.Usuario;
import com.example.demo.repository.PerfilRepository;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.security.Roles;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Crea el Admin inicial desde variables de entorno (ADMIN_EMAIL / ADMIN_PASSWORD). Idempotente. */
@Component
public class AdminBootstrap implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final UsuarioRepository usuarioRepository;
    private final PerfilRepository perfilRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.correo:}") private String correo;
    @Value("${app.admin.password:}") private String password;
    @Value("${app.admin.nombre:Administrador}") private String nombre;
    @Value("${app.admin.apellido:ConciliaYa}") private String apellido;

    public AdminBootstrap(UsuarioRepository usuarioRepository, PerfilRepository perfilRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.perfilRepository = perfilRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (correo.isBlank() || password.isBlank()) {
            log.warn("ADMIN_EMAIL/ADMIN_PASSWORD no definidos: no se creó Admin inicial.");
            return;
        }
        if (password.length() < 8) {
            throw new IllegalStateException("ADMIN_PASSWORD debe tener al menos 8 caracteres");
        }
        if (usuarioRepository.existsByCorreo(correo.trim())) {
            log.info("Admin inicial ya existe ({}); no se modifica.", correo);
            return;
        }
        Perfil perfilAdmin = perfilRepository.findById(Roles.PERFIL_ADMIN)
                .orElseThrow(() -> new IllegalStateException("Perfil Administrador (id 1) no existe: ejecute schema.sql"));
        Usuario u = new Usuario();
        u.setNombre(nombre);
        u.setApellido(apellido);
        u.setCorreo(correo.trim());
        u.setPassword(passwordEncoder.encode(password));
        u.setPerfil(perfilAdmin);
        usuarioRepository.save(u);
        log.info("Admin inicial creado: {}", correo);
    }
}
