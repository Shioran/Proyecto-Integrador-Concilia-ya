import pandas as pd

# Columnas disponibles post-limpieza: id, nombre, codigo, descripcion, activo

def transformar_datos_estadoConflictos(df):

    # agrupacion1: cuántos registros tiene cada estado (nombre) — activos vs inactivos
    ag1 = df.groupby(["nombre", "activo"])["id"].count().reset_index(name="conteo")

    # agrupacion2: distribución de estados activos (para torta)
    ag2 = df[df["activo"] == True].groupby("nombre")["id"].count().reset_index(name="conteo")

    # agrupacion3: distribución de estados inactivos (para comparar)
    ag3 = df[df["activo"] == False].groupby("nombre")["id"].count().reset_index(name="conteo")

    # agrupacion4: código vs nombre activo (para mapa de calor)
    ag4 = df[df["activo"] == True].groupby(["codigo", "nombre"])["id"].count().reset_index(name="conteo")

    return {
        "agrupacion1": ag1,
        "agrupacion2": ag2,
        "agrupacion3": ag3,
        "agrupacion4": ag4
    }
