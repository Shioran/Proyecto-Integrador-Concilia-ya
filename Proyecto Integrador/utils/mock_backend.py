"""
Backend de ensayo (solo librería estándar): imita el contrato de FASE1_API.md.

    python -m utils.mock_backend            # escucha en http://localhost:8080
    python -m utils.mock_backend --puerto 9090

Cuentas de prueba:
    admin@conciliaya.test    / Admin12345     -> rol ADMIN   (el análisis funciona)
    usuario@conciliaya.test  / Usuario12345   -> rol USUARIO (el análisis lo rechaza)

SOLO para ensayar: no usa base de datos y el token no es un JWT real.
"""
import argparse
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from utils.simulacion_api import generar_datos

TOKEN_ADMIN = "mock-token-admin"
CUENTAS = {
    "admin@conciliaya.test": ("Admin12345", {"token": TOKEN_ADMIN, "id": 1, "nombre": "Admin Mock",
                                             "correo": "admin@conciliaya.test", "perfilId": 1, "rol": "ADMIN"}),
    "usuario@conciliaya.test": ("Usuario12345", {"token": "mock-token-usuario", "id": 9, "nombre": "Usuario Mock",
                                                 "correo": "usuario@conciliaya.test", "perfilId": 3, "rol": "USUARIO"}),
}
DATOS = generar_datos()
RUTAS = {"/api/perfiles": "perfiles", "/api/usuarios": "usuarios", "/api/estados-conflicto": "estados",
         "/api/tipos-conflicto": "tipos", "/api/conflictos": "conflictos", "/api/mediaciones": "mediaciones"}


class Handler(BaseHTTPRequestHandler):
    def _responder(self, codigo, cuerpo):
        datos = json.dumps(cuerpo, ensure_ascii=False).encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(datos)))
        self.end_headers()
        self.wfile.write(datos)

    def do_POST(self):
        if self.path != "/api/auth/login":
            return self._responder(404, {"status": 404, "error": "Not Found"})
        longitud = int(self.headers.get("Content-Length", 0))
        cuerpo = json.loads(self.rfile.read(longitud) or "{}")
        clave, perfil = CUENTAS.get(cuerpo.get("correo"), (None, None))
        if clave is None or clave != cuerpo.get("password"):
            return self._responder(401, {"status": 401, "error": "Unauthorized", "message": "Credenciales inválidas"})
        self._responder(200, perfil)

    def do_GET(self):
        auth = self.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return self._responder(401, {"status": 401, "error": "Unauthorized", "message": "Falta el token"})
        token = auth[7:]
        if token == "mock-token-usuario" and self.path in ("/api/usuarios", "/api/perfiles"):
            return self._responder(403, {"status": 403, "error": "Forbidden", "message": "Solo ADMIN"})
        if token not in (TOKEN_ADMIN, "mock-token-usuario"):
            return self._responder(401, {"status": 401, "error": "Unauthorized", "message": "Token inválido"})
        if self.path == "/api/health":
            return self._responder(200, {"status": "UP"})
        if self.path in RUTAS:
            return self._responder(200, DATOS[RUTAS[self.path]])
        self._responder(404, {"status": 404, "error": "Not Found"})

    def log_message(self, formato, *args):
        print(f"[mock] {self.command} {self.path} -> {args[1] if len(args) > 1 else ''}")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--puerto", type=int, default=8080)
    puerto = p.parse_args().puerto
    print(f"Mock de ConciliaYa en http://localhost:{puerto}/api  (Ctrl+C para detener)")
    ThreadingHTTPServer(("127.0.0.1", puerto), Handler).serve_forever()
