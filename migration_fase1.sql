-- ============================================================
-- ConciliaYa - Migración Fase 1 (BD existente). HAGA BACKUP ANTES.
-- Ejecutar una sola vez sobre conciliadb.
-- ============================================================
USE conciliadb;

-- 1) Eliminar Publicaciones
DROP TABLE IF EXISTS publicacion;

-- 2) Mediación: el estado vive solo en conflicto
ALTER TABLE mediacion DROP FOREIGN KEY fk_mediacion_estado;
ALTER TABLE mediacion DROP COLUMN estado_conflicto_id;
ALTER TABLE mediacion
  ADD COLUMN dictamen VARCHAR(2000) NULL AFTER resultado,
  ADD COLUMN fecha_cierre DATETIME NULL AFTER fecha_registro,
  ADD INDEX idx_mediacion_conflicto_activo (conflicto_id, activo);

-- 3) Coherencia de datos previos: "activo" = mediación en curso
UPDATE mediacion m
  JOIN conflicto c ON c.id = m.conflicto_id
  JOIN estado_conflicto e ON e.id = c.estado_conflicto_id
   SET m.activo = (e.codigo = 'EN_MEDIACION');

-- 4) Sesiones de mediación
CREATE TABLE IF NOT EXISTS sesion_mediacion (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  mediacion_id BIGINT NOT NULL,
  fecha DATETIME NOT NULL,
  lugar VARCHAR(200),
  observaciones VARCHAR(2000) NOT NULL,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sesion_mediacion FOREIGN KEY (mediacion_id) REFERENCES mediacion(id),
  INDEX idx_sesion_mediacion_fecha (mediacion_id, fecha)
);

-- 5) Notificaciones ligadas a un conflicto
ALTER TABLE notificacion
  ADD COLUMN conflicto_id BIGINT NULL AFTER usuario_id,
  ADD CONSTRAINT fk_notificacion_conflicto FOREIGN KEY (conflicto_id) REFERENCES conflicto(id),
  ADD INDEX idx_notificacion_usuario (usuario_id, leida);

-- 6) Integridad: código de estado único (falla si hay códigos duplicados: corríjalos antes)
ALTER TABLE estado_conflicto ADD CONSTRAINT uq_estado_codigo UNIQUE (codigo);

-- 7) Documento único (la entidad ya lo declaraba). Falla si hay duplicados: depure antes.
ALTER TABLE usuario ADD CONSTRAINT uq_usuario_documento UNIQUE (documento);

-- 8) Usuarios previos: perfiles sin password BCrypt no podrán iniciar sesión hasta que el Admin les asigne una.
