"""
ConciliaYa - Fase 3: capa de análisis en Python.

Pipeline:  LOGIN (JWT) -> CONSUMO -> LIMPIEZA -> DESCRIPCIÓN -> TRANSFORMACIÓN -> GRÁFICOS

Uso (con el backend Spring Boot encendido):
    set ADMIN_EMAIL=admin@correo.com         (PowerShell: $env:ADMIN_EMAIL="...")
    set ADMIN_PASSWORD=su_clave
    python main.py

Si no se definen las variables, el script pide el correo y la contraseña por consola.
"""
import sys

import pandas as pd

# Capa de Consumo (API autenticada con JWT)
from notebook.consumo_api import obtener_cliente, ErrorApi, API_BASE_URL
from notebook.consumo_estadoconflicto import consumir_estadoconflicto
from notebook.consumo_perfil import consumir_perfil
from notebook.consumo_usuario import consumir_usuario
from notebook.consumo_tipoconflicto import consumir_tipo_conflicto
from notebook.consumo_conflicto import consumir_conflicto
from notebook.consumo_mediacion import consumir_mediacion

# Capa de Limpieza
from notebook.limpieza_estadoconflicto import limpiar_estadoConflictos
from notebook.limpieza_perfil import limpiar_perfil
from notebook.limpieza_usuraios import limpiar_usuarios  # el archivo conserva su nombre original
from notebook.limpieza_tipoconflicto import limpiar_tipoConflicto
from notebook.limpieza_conflicto import limpiar_conflicto
from notebook.limpieza_mediacion import limpiar_mediacion

# Capa de Descripción
from notebook.descripcion_estadoconflicto import describir_estadoConflictos
from notebook.descripcion_perfil import describir_perfil
from notebook.descripcion_usuario import describir_usuarios
from notebook.descripcion_tipoconflicto import describir_tipoConflicto
from notebook.descripcion_conflicto import describir_conflicto
from notebook.descripcion_mediacion import describir_mediacion

# Capa de Transformación
from notebook.tranformacion_estadoconflicto import transformar_datos_estadoConflictos
from notebook.transformacion_perfil import transformar_datos_perfil
from notebook.transformacion_usuario import transformar_datos_usuarios
from notebook.transformacion_tipoconflicto import transformar_datos_tipoConflicto
from notebook.transformacion_conflicto import transformar_datos_conflicto
from notebook.transformacion_mediacion import transformar_datos_mediacion

# Capa de Graficación
from notebook.graficar import (graficar_barras, graficar_torta, graficar_mapa_calor,
                               graficar_lineas, RUTA_ASSETS)

# ==============================================================================
# CONTRATO USADO (ver FASE1_API.md) - todos GET, todos con "Authorization: Bearer <token>"
#   /api/perfiles, /api/usuarios            -> solo ADMIN
#   /api/tipos-conflicto, /api/estados-conflicto -> autenticado (el Admin ve todo)
#   /api/conflictos, /api/mediaciones       -> el Admin ve todos los registros
# Conflicto y Mediacion llegan APLANADOS (tipoConflictoNombre, estadoConflictoNombre,
# mediadorNombre, ...), por eso ya no hay que "desanidar" objetos.
# ==============================================================================


def main():
    # ---------------------------------------------------------------- 1. LOGIN
    print("=== CAPA 0: AUTENTICACIÓN ===")
    try:
        cliente = obtener_cliente()
        sesion = cliente.login()
    except ErrorApi as e:
        print(f"✖ {e}")
        sys.exit(1)
    print(f"✔ Sesión iniciada en {API_BASE_URL} como {sesion['nombre']} ({sesion['rol']}).\n")

    # -------------------------------------------------------------- 2. CONSUMO
    print("=== CAPA 1: CONSUMIENDO LA API ===")
    try:
        crudos = {
            "perfiles":   consumir_perfil(),
            "usuarios":   consumir_usuario(),
            "estados":    consumir_estadoconflicto(),
            "tipos":      consumir_tipo_conflicto(),
            "conflictos": consumir_conflicto(),
            "mediaciones": consumir_mediacion(),
        }
    except ErrorApi as e:
        print(f"✖ {e}")
        sys.exit(1)
    for nombre, registros in crudos.items():
        print(f"  {nombre:<12} {len(registros):>5} registros recibidos")
    df = {k: pd.DataFrame(v) for k, v in crudos.items()}
    print()

    # ------------------------------------------------------------- 3. LIMPIEZA
    print("=== CAPA 2: LIMPIEZA DE DATOS ===")
    df_perf = limpiar_perfil(df["perfiles"])
    df_user = limpiar_usuarios(df["usuarios"], df_perf)  # usa los perfiles para rotular perfilId
    df_ec = limpiar_estadoConflictos(df["estados"])
    df_tc = limpiar_tipoConflicto(df["tipos"])
    df_conf = limpiar_conflicto(df["conflictos"])
    df_med = limpiar_mediacion(df["mediaciones"])
    for nombre, antes, despues in [
        ("perfiles", df["perfiles"], df_perf), ("usuarios", df["usuarios"], df_user),
        ("estados", df["estados"], df_ec), ("tipos", df["tipos"], df_tc),
        ("conflictos", df["conflictos"], df_conf), ("mediaciones", df["mediaciones"], df_med),
    ]:
        print(f"  {nombre:<12} {len(antes):>5} -> {len(despues):>5} (descartados: {len(antes) - len(despues)})")
    print()

    # -------------------------------------------------------------- 4. DESCRIPCIÓN
    print("=== CAPA 3: DESCRIPCIÓN DE DATOS LIMPIOS ===")
    describir_estadoConflictos(df_ec)
    describir_perfil(df_perf)
    describir_usuarios(df_user)
    describir_tipoConflicto(df_tc)
    describir_conflicto(df_conf)
    describir_mediacion(df_med)
    print()

    # ---------------------------------------------------------- 5. TRANSFORMACIÓN
    print("=== CAPA 4: AGRUPACIONES ===")
    transformar_datos_estadoConflictos(df_ec)   # catálogos: solo se validan
    transformar_datos_perfil(df_perf)
    transformar_datos_tipoConflicto(df_tc)
    res_user = transformar_datos_usuarios(df_user)
    res_conf = transformar_datos_conflicto(df_conf)
    res_med = transformar_datos_mediacion(df_med)
    print("✔ Agrupaciones creadas.\n")

    # -------------------------------------------------------------- 6. GRÁFICOS
    # Los catálogos (estados, tipos, perfiles) tienen pocas filas fijas, así que NO se
    # grafican por sí solos: los gráficos se construyen sobre los datos reales de negocio
    # (conflictos, usuarios, mediaciones) usando los catálogos como etiquetas.
    print("=== CAPA 5: GENERANDO GRÁFICOS ===")

    # 1 - Conflictos activos por estado (torta)
    graficar_torta(res_conf["agrupacion2"], "estadoConflictoNombre", "conteo",
                   titulo="Conflictos activos por estado",
                   nombre_archivo="torta_conflictos_por_estado.png")

    # 2 - Usuarios activos por perfil (barras)
    graficar_barras(res_user["agrupacion2"], "perfilNombre", "conteo",
                    titulo="Usuarios activos por perfil", color_barras="#7E57C2",
                    nombre_archivo="barras_usuarios_por_perfil.png")

    # 3 - Conflictos por tipo (torta)
    graficar_torta(res_conf["agrupacion1"], "tipoConflictoNombre", "conteo",
                   titulo="Conflictos registrados por tipo",
                   nombre_archivo="torta_conflictos_por_tipo.png")

    # 4 - Usuarios: tipo de documento x perfil (mapa de calor).
    #     Si la API no informa el tipo de documento, se cae a perfil x activo.
    if (df_user["tipoDocumento"] != "SIN DATO").any():
        graficar_mapa_calor(res_user["agrupacion3"], "tipoDocumento", "perfilNombre", "conteo",
                            titulo="Usuarios: tipo de documento × perfil", paleta_color="Blues",
                            nombre_archivo="mapa_calor_usuarios_documento_perfil.png")
    else:
        graficar_mapa_calor(res_user["agrupacion5"], "perfilNombre", "activo", "conteo",
                            titulo="Usuarios: perfil × estado de la cuenta", paleta_color="Blues",
                            nombre_archivo="mapa_calor_usuarios_perfil_activo.png")

    # 5 - Conflictos: tipo x estado (mapa de calor)
    graficar_mapa_calor(res_conf["agrupacion3"], "tipoConflictoNombre", "estadoConflictoNombre", "conteo",
                        titulo="Conflictos: tipo × estado (densidad de casos)", paleta_color="YlOrRd",
                        nombre_archivo="mapa_calor_conflictos_tipo_estado.png")

    # 6 - Mediaciones: sede x resultado (mapa de calor)
    graficar_mapa_calor(res_med["agrupacion3"], "lugar", "resultado", "conteo",
                        titulo="Mediaciones: sede × resultado", paleta_color="Greens",
                        nombre_archivo="mapa_calor_mediaciones_sede_resultado.png")

    # 7 - Evolución de conflictos por fecha de inicio (líneas)
    graficar_lineas(res_conf["agrupacion5"], "fechaInicioDia", "conteo",
                    titulo="Conflictos registrados por día", color_linea="#E65100",
                    nombre_archivo="lineas_conflictos_por_dia.png")

    print(f"\n✔ Gráficos exportados en: {RUTA_ASSETS}")
    print("=== PIPELINE FINALIZADO ===")


if __name__ == "__main__":
    main()
