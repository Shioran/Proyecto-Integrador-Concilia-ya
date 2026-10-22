import pandas as pd

# Columnas disponibles post-limpieza (aplanadas):
# id, conflictoId, mediadorId, mediadorNombre, estadoNombre,
# fechaProgramada, lugar, observaciones, resultado, fechaRegistro, activo

def transformar_datos_mediacion(df):

    # agrupacion1: resultados de todas las mediaciones (torta) — ¿qué tan exitosas son?
    ag1 = df.groupby("resultado")["id"].count().reset_index(name="conteo")

    # agrupacion2: mediaciones por lugar (barras) — ¿dónde se realizan más?
    ag2 = df.groupby("lugar")["id"].count().reset_index(name="conteo")

    # agrupacion3: resultado × lugar → mapa de calor — ¿en qué sede se logran más acuerdos?
    ag3 = df.groupby(["lugar", "resultado"])["id"].count().reset_index(name="conteo")

    # agrupacion4: mediaciones activas por mediador (barras) — carga de trabajo
    ag4 = df[df["activo"] == True].groupby("mediadorNombre")["id"].count().reset_index(name="conteo")

    # agrupacion5: evolución de mediaciones programadas por fecha (líneas)
    con_fecha = df.dropna(subset=["fechaProgramada"]).assign(fechaDia=lambda d: d["fechaProgramada"].dt.date)
    ag5 = con_fecha.groupby("fechaDia")["id"].count().reset_index(name="conteo")
    ag5["fechaDia"] = ag5["fechaDia"].astype(str)

    # agrupacion6: mediaciones por estado del conflicto asociado (barras)
    ag6 = df.groupby("estadoNombre")["id"].count().reset_index(name="conteo")

    return {
        "agrupacion1": ag1,
        "agrupacion2": ag2,
        "agrupacion3": ag3,
        "agrupacion4": ag4,
        "agrupacion5": ag5,
        "agrupacion6": ag6
    }
