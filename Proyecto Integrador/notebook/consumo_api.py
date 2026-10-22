"""
Cliente HTTP autenticado para el backend Spring Boot de ConciliaYa.

Flujo (el mismo que usa el frontend React):
  1. POST /api/auth/login  {correo, password}  ->  {token, id, nombre, correo, perfilId, rol}
  2. Cada GET lleva el header  Authorization: Bearer <token>
  3. Si el backend responde 401 (token vencido) se vuelve a iniciar sesión una vez.

Las credenciales NUNCA se escriben en el código. Se leen de variables de entorno
(ADMIN_EMAIL / ADMIN_PASSWORD, las mismas con las que el backend crea al Admin inicial)
o, si no existen, se piden por consola.

Variables de entorno:
  API_BASE_URL    Por defecto http://localhost:8080/api
  ADMIN_EMAIL     Correo del usuario con perfil Administrador
  ADMIN_PASSWORD  Su contraseña
"""
import getpass
import os
import sys

import requests

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8080/api").rstrip("/")
TIMEOUT_SEGUNDOS = 15


class ErrorApi(Exception):
    """Error controlado (conexión, credenciales, permisos). Trae un mensaje listo para mostrar."""


class ClienteApi:
    def __init__(self, base_url=API_BASE_URL, correo=None, password=None):
        self.base_url = base_url.rstrip("/")
        self._correo = correo or os.getenv("ADMIN_EMAIL")
        self._password = password or os.getenv("ADMIN_PASSWORD")
        self._sesion = requests.Session()
        self._token = None
        self.usuario = None  # datos devueltos por el login

    # ------------------------------------------------------------------ login
    def _pedir_credenciales(self):
        if self._correo and self._password:
            return
        if not sys.stdin.isatty():
            raise ErrorApi(
                "Faltan credenciales. Define las variables de entorno ADMIN_EMAIL y ADMIN_PASSWORD."
            )
        print("Credenciales del Administrador (no se guardan):")
        self._correo = self._correo or input("  Correo: ").strip()
        self._password = self._password or getpass.getpass("  Contraseña: ")

    def login(self):
        self._pedir_credenciales()
        try:
            r = self._sesion.post(
                f"{self.base_url}/auth/login",
                json={"correo": self._correo, "password": self._password},
                timeout=TIMEOUT_SEGUNDOS,
            )
        except requests.exceptions.RequestException as e:
            raise ErrorApi(
                f"No se pudo conectar con el backend en {self.base_url}. "
                f"¿Está encendido Spring Boot? ({type(e).__name__})"
            ) from e

        if r.status_code == 401:
            raise ErrorApi("Login rechazado (401): correo o contraseña incorrectos.")
        if not r.ok:
            raise ErrorApi(f"Login falló con HTTP {r.status_code}: {r.text[:200]}")

        datos = r.json()
        if datos.get("rol") != "ADMIN":
            raise ErrorApi(
                f"El usuario {datos.get('correo')} tiene rol {datos.get('rol')}. "
                "El análisis necesita un Administrador (GET /usuarios y /perfiles son solo ADMIN)."
            )
        self._token = datos["token"]
        self.usuario = datos
        return datos

    # -------------------------------------------------------------------- GET
    def get(self, ruta):
        """GET autenticado. Devuelve el JSON ya convertido a lista/dict de Python."""
        if self._token is None:
            self.login()

        for intento in (1, 2):
            try:
                r = self._sesion.get(
                    f"{self.base_url}{ruta}",
                    headers={"Authorization": f"Bearer {self._token}"},
                    timeout=TIMEOUT_SEGUNDOS,
                )
            except requests.exceptions.RequestException as e:
                raise ErrorApi(f"Fallo de red al consultar {ruta}: {type(e).__name__}") from e

            if r.status_code == 401 and intento == 1:  # token vencido: reintento una vez
                self.login()
                continue
            if r.status_code == 401:
                raise ErrorApi(f"{ruta}: el backend sigue respondiendo 401 tras reautenticar.")
            if r.status_code == 403:
                raise ErrorApi(f"{ruta}: acceso denegado (403). Se requiere perfil Administrador.")
            if not r.ok:
                raise ErrorApi(f"{ruta}: HTTP {r.status_code} - {r.text[:200]}")

            cuerpo = r.json()
            # Por si algún endpoint llegara paginado al estilo Spring: {"content": [...]}
            if isinstance(cuerpo, dict) and isinstance(cuerpo.get("content"), list):
                return cuerpo["content"]
            return cuerpo


_cliente = None


def obtener_cliente():
    """Un único cliente (y un único login) compartido por todos los consumo_*.py."""
    global _cliente
    if _cliente is None:
        _cliente = ClienteApi()
    return _cliente
