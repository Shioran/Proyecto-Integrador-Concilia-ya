# ConciliaYa – Fase 3: capa de análisis en Python

Consume la API Spring Boot (JWT, perfil **Administrador**), limpia los datos aplanados
y genera 7 gráficos PNG con pandas, matplotlib y seaborn.

## Ejecutar
```bash
python -m venv venv
venv\Scripts\activate            # Windows   (Linux/macOS: source venv/bin/activate)
pip install -r requirements.txt

# credenciales del Admin (las mismas ADMIN_EMAIL / ADMIN_PASSWORD con las que arrancó el backend)
set ADMIN_EMAIL=admin@correo.com                 # PowerShell: $env:ADMIN_EMAIL="admin@correo.com"
set ADMIN_PASSWORD=su_clave                      # PowerShell: $env:ADMIN_PASSWORD="su_clave"
python main.py
```
Si no defines las variables, el script pide correo y contraseña por consola.
Los gráficos quedan en `salida/graficos/` (cámbialo con `GRAFICOS_DIR`).
Otro host/puerto del backend: `API_BASE_URL` (por defecto `http://localhost:8080/api`).

## Ensayo sin backend ni MySQL
```bash
python -m utils.mock_backend            # terminal 1: imita la API en :8080
python main.py                          # terminal 2 (admin@conciliaya.test / Admin12345)
```
`usuario@conciliaya.test / Usuario12345` entra con rol USUARIO y el script lo rechaza (demuestra el control por rol).

## Pipeline y archivos
| Capa | Archivos |
|---|---|
| Login + consumo (JWT) | `notebook/consumo_api.py` (login, Bearer, reintento en 401) y `consumo_*.py` (un GET por recurso) |
| Limpieza | `notebook/limpieza_*.py` + `utilidades_limpieza.py` |
| Descripción | `notebook/descripcion_*.py` |
| Transformación | `notebook/transformacion_*.py` (agrupaciones `groupby`) |
| Gráficos | `notebook/graficar.py` |
| Orquestador | `main.py` |
| Ensayo | `utils/simulacion_api.py`, `utils/mock_backend.py` |

## Decisiones de diseño
- Conflicto y Mediación llegan **aplanados** (`tipoConflictoNombre`, `mediadorNombre`…): ya no se desanidan objetos.
- Se eliminaron las listas de valores "permitidos" del simulador (p. ej. solo Pago/Contrato/Servicio): descartarían datos reales.
- Campos opcionales del contrato (`montoReclamado`, `lugar`, `resultado`, `fechaCierre`) **no** descartan filas: `resultado` nulo en una mediación = «Pendiente»; `lugar` nulo = «Sin sede definida».
- Los catálogos (estados, tipos, perfiles) tienen pocas filas fijas; los gráficos se hacen sobre conflictos, usuarios y mediaciones, usando los catálogos como etiquetas.
- Las credenciales nunca están en el código.
