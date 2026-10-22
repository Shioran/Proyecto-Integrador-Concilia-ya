import pandas as pd

# Columnas disponibles post-limpieza: id, nombre, descripcion, activo
# IMPORTANTE: NO hay fechaAlta en el PerfilDto → no se puede graficar tendencia temporal

def transformar_datos_perfil(df):

    # agrupacion1: conteo de registros por nombre de perfil (para barras)
    ag1 = df.groupby("nombre")["id"].count().reset_index(name="conteo")

    # agrupacion2: distribución activo vs inactivo por tipo de perfil (para mapa de calor)
    ag2 = df.groupby(["nombre", "activo"])["id"].count().reset_index(name="conteo")

    # agrupacion3: perfiles activos únicamente (para torta)
    ag3 = df[df["activo"] == True].groupby("nombre")["id"].count().reset_index(name="conteo")

    # agrupacion4: perfiles inactivos únicamente (comparación)
    ag4 = df[df["activo"] == False].groupby("nombre")["id"].count().reset_index(name="conteo")

    return {
        "agrupacion1": ag1,
        "agrupacion2": ag2,
        "agrupacion3": ag3,
        "agrupacion4": ag4
    }
