import pandas as pd

# Columnas disponibles post-limpieza (aplanadas):
# id, tipoConflictoId, tipoConflictoNombre, estadoConflictoId, estadoConflictoNombre,
# demandanteId, demandadoId, asunto, descripcion, fechaInicio, fechaCierre,
# resultado, montoReclamado, activo, fechaAlta

def transformar_datos_conflicto(df):

    # agrupacion1: conflictos por tipo (barras) — ¿qué tipo de conflicto predomina?
    ag1 = df.groupby("tipoConflictoNombre")["id"].count().reset_index(name="conteo")

    # agrupacion2: conflictos activos por estado (barras) — ¿cuántos están abiertos/en proceso/cerrados?
    ag2 = df[df["activo"] == True].groupby("estadoConflictoNombre")["id"].count().reset_index(name="conteo")

    # agrupacion3: tipo × estado → mapa de calor — ¿qué combinaciones concentran más casos?
    ag3 = df.groupby(["tipoConflictoNombre", "estadoConflictoNombre"])["id"].count().reset_index(name="conteo")

    # agrupacion4: monto promedio reclamado por tipo de conflicto (barras de montos)
    ag4 = df.groupby("tipoConflictoNombre")["montoReclamado"].mean().reset_index()
    ag4 = ag4.rename(columns={"montoReclamado": "montoPromedio"})
    ag4["montoPromedio"] = ag4["montoPromedio"].round(2)

    # agrupacion5: evolución de conflictos en el tiempo por fecha de inicio (líneas)
    con_fecha = df.dropna(subset=["fechaInicio"]).assign(fechaInicioDia=lambda d: d["fechaInicio"].dt.date)
    ag5 = con_fecha.groupby("fechaInicioDia")["id"].count().reset_index(name="conteo")
    ag5["fechaInicioDia"] = ag5["fechaInicioDia"].astype(str)

    # agrupacion6: resultados de conflictos con dictamen (Acuerdo / Sin acuerdo) (torta)
    cerrados = df[df["fechaCierre"].notna() & df["resultado"].notna()]
    ag6 = cerrados.groupby("resultado")["id"].count().reset_index(name="conteo")

    return {
        "agrupacion1": ag1,
        "agrupacion2": ag2,
        "agrupacion3": ag3,
        "agrupacion4": ag4,
        "agrupacion5": ag5,
        "agrupacion6": ag6
    }
