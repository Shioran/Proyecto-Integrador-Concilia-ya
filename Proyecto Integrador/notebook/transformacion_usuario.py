import pandas as pd

# Columnas disponibles post-limpieza:
# id, nombre, apellido, tipoDocumento, documento, correo, telefono,
# perfilId, perfilNombre, activo, fechaAlta

def transformar_datos_usuarios(df):

    # agrupacion1: usuarios por tipo de documento (barras)
    ag1 = df.groupby("tipoDocumento")["id"].count().reset_index(name="conteo")

    # agrupacion2: usuarios activos por perfil asignado (barras)
    ag2 = df[df["activo"] == True].groupby("perfilNombre")["id"].count().reset_index(name="conteo")

    # agrupacion3: tipo de documento × perfil → mapa de calor
    ag3 = df.groupby(["tipoDocumento", "perfilNombre"])["id"].count().reset_index(name="conteo")

    # agrupacion4: altas de usuarios por fecha (línea de tiempo)
    con_fecha = df.dropna(subset=["fechaAlta"]).assign(fechaAltaDia=lambda d: d["fechaAlta"].dt.date)
    ag4 = con_fecha.groupby("fechaAltaDia")["id"].count().reset_index(name="conteo")
    ag4["fechaAltaDia"] = ag4["fechaAltaDia"].astype(str)

    # agrupacion5: activos vs inactivos por perfil (comparación)
    ag5 = df.groupby(["perfilNombre", "activo"])["id"].count().reset_index(name="conteo")

    return {
        "agrupacion1": ag1,
        "agrupacion2": ag2,
        "agrupacion3": ag3,
        "agrupacion4": ag4,
        "agrupacion5": ag5
    }
