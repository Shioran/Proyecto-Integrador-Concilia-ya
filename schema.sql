-- ============================================================
-- ConciliaYa - Schema (instalación limpia) - Fase 1
-- Para una BD existente usar migration_fase1.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS conciliadb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE conciliadb;

CREATE TABLE IF NOT EXISTS perfil (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  descripcion VARCHAR(300),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_alta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuario (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  tipo_documento VARCHAR(20),
  documento VARCHAR(60),
  correo VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255),
  telefono VARCHAR(30),
  perfil_id BIGINT,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_alta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_usuario_documento UNIQUE (documento),
  CONSTRAINT fk_usuario_perfil FOREIGN KEY (perfil_id) REFERENCES perfil(id)
);

CREATE TABLE IF NOT EXISTS tipo_conflicto (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(300),
  activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS estado_conflicto (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  descripcion VARCHAR(300),
  activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS conflicto (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_demandante_id BIGINT NOT NULL,
  usuario_demandado_id BIGINT NOT NULL,
  tipo_conflicto_id BIGINT NOT NULL,
  estado_conflicto_id BIGINT NOT NULL,
  asunto VARCHAR(200) NOT NULL,
  descripcion VARCHAR(1000),
  fecha_inicio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_cierre DATETIME,
  resultado VARCHAR(200),               -- ACUERDO | SIN_ACUERDO
  monto_reclamado DOUBLE,
  activo BOOLEAN NOT NULL DEFAULT TRUE, -- FALSE = cancelado por el demandante
  fecha_alta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_conflicto_demandante FOREIGN KEY (usuario_demandante_id) REFERENCES usuario(id),
  CONSTRAINT fk_conflicto_demandado FOREIGN KEY (usuario_demandado_id) REFERENCES usuario(id),
  CONSTRAINT fk_conflicto_tipo FOREIGN KEY (tipo_conflicto_id) REFERENCES tipo_conflicto(id),
  CONSTRAINT fk_conflicto_estado FOREIGN KEY (estado_conflicto_id) REFERENCES estado_conflicto(id)
);

-- El estado vive solo en conflicto. mediacion.activo = mediación en curso.
CREATE TABLE IF NOT EXISTS mediacion (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  conflicto_id BIGINT NOT NULL,
  usuario_mediador_id BIGINT NOT NULL,
  fecha_programada DATETIME,
  lugar VARCHAR(200),
  observaciones VARCHAR(1000),
  resultado VARCHAR(200),               -- ACUERDO | SIN_ACUERDO (NULL mientras está en curso)
  dictamen VARCHAR(2000),
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_cierre DATETIME,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_mediacion_conflicto FOREIGN KEY (conflicto_id) REFERENCES conflicto(id),
  CONSTRAINT fk_mediacion_mediador FOREIGN KEY (usuario_mediador_id) REFERENCES usuario(id),
  INDEX idx_mediacion_conflicto_activo (conflicto_id, activo)
);

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

CREATE TABLE IF NOT EXISTS notificacion (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT NOT NULL,
  conflicto_id BIGINT,
  mensaje VARCHAR(1000),
  leida BOOLEAN NOT NULL DEFAULT FALSE,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notificacion_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  CONSTRAINT fk_notificacion_conflicto FOREIGN KEY (conflicto_id) REFERENCES conflicto(id),
  INDEX idx_notificacion_usuario (usuario_id, leida)
);

-- Datos base. Los ids 1/2/3 de perfil están ligados a los roles ADMIN/MEDIADOR/USUARIO.
INSERT IGNORE INTO perfil (id, nombre, descripcion, activo) VALUES
  (1, 'Administrador', 'Acceso total al sistema', TRUE),
  (2, 'Mediador', 'Gestiona sesiones y dictamina mediaciones', TRUE),
  (3, 'Usuario', 'Registra conflictos y consulta su avance', TRUE);

-- Los códigos de estado son usados por la lógica de negocio: no modificarlos.
INSERT IGNORE INTO estado_conflicto (id, nombre, codigo, descripcion, activo) VALUES
  (1, 'Abierto', 'ABIERTO', 'Conflicto recién registrado', TRUE),
  (2, 'En mediación', 'EN_MEDIACION', 'Proceso de mediación en curso', TRUE),
  (3, 'Resuelto', 'RESUELTO', 'Conflicto resuelto con acuerdo', TRUE),
  (4, 'Cerrado', 'CERRADO', 'Conflicto cerrado sin acuerdo', TRUE);

INSERT IGNORE INTO tipo_conflicto (id, nombre, descripcion, activo) VALUES
  (1, 'Laboral', 'Conflictos relacionados con el trabajo', TRUE),
  (2, 'Familiar', 'Conflictos de índole familiar', TRUE),
  (3, 'Comercial', 'Disputas comerciales o contractuales', TRUE),
  (4, 'Vecinal', 'Conflictos entre vecinos o comunidades', TRUE);

-- El Admin inicial NO se siembra aquí: se crea al arrancar con ADMIN_EMAIL / ADMIN_PASSWORD.
