import pandas as pd

# Columnas disponibles post-limpieza: id, nombre, descripcion, activo

def transformar_datos_tipoConflicto(df):

    # agrupacion1: conteo por tipo de conflicto (para barras)
    ag1 = df.groupby("nombre")["id"].count().reset_index(name="conteo")

    # agrupacion2: activos vs inactivos por tipo (para mapa de calor)
    ag2 = df.groupby(["nombre", "activo"])["id"].count().reset_index(name="conteo")

    # agrupacion3: tipos activos únicamente (para torta)
    ag3 = df[df["activo"] == True].groupby("nombre")["id"].count().reset_index(name="conteo")

    # agrupacion4: tipos inactivos únicamente
    ag4 = df[df["activo"] == False].groupby("nombre")["id"].count().reset_index(name="conteo")

    return {
        "agrupacion1": ag1,
        "agrupacion2": ag2,
        "agrupacion3": ag3,
        "agrupacion4": ag4
    }
