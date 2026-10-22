import pandas as pd
from notebook.utilidades_limpieza import (
    asegurar_columnas, a_texto, a_booleano, a_fecha, etiquetar_resultado)

# GET /api/mediaciones  ->  MediacionResponse (YA VIENE APLANADO):
#   id, conflictoId, mediadorId, mediadorNombre, estadoNombre (+ estadoCodigo),
#   fechaProgramada, lugar, observaciones, resultado, fechaRegistro, activo
#
# Reglas del contrato:
#   - lugar y fechaProgramada son opcionales
#   - resultado es null mientras la mediación sigue en curso (se fija con el dictamen)
#   - activo = false cuando ya hubo dictamen


def limpiar_mediacion(df_sucio):
    df = asegurar_columnas(
        df_sucio,
        ["id", "conflictoId", "mediadorId", "mediadorNombre", "estadoNombre", "estadoCodigo",
         "fechaProgramada", "lugar", "observaciones", "resultado", "fechaRegistro", "activo"],
    )

    # 1. Textos
    df["mediadorNombre"] = a_texto(df["mediadorNombre"])
    df["estadoNombre"] = a_texto(df["estadoNombre"])
    df["estadoCodigo"] = a_texto(df["estadoCodigo"], mayusculas=True)
    df["observaciones"] = a_texto(df["observaciones"])
    df["lugar"] = a_texto(df["lugar"]).fillna("Sin sede definida")
    df["resultado"] = etiquetar_resultado(df["resultado"], relleno="Pendiente")

    # 2. Numéricos y booleanos
    for col in ["id", "conflictoId", "mediadorId"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df["activo"] = a_booleano(df["activo"], por_defecto=True)

    # 3. Fechas
    df["fechaProgramada"] = a_fecha(df["fechaProgramada"])
    df["fechaRegistro"] = a_fecha(df["fechaRegistro"])

    # 4. Obligatorias
    df = df[(df["id"] > 0) & (df["conflictoId"] > 0)]
    df = df.dropna(subset=["id", "conflictoId", "mediadorId"])
    df["mediadorNombre"] = df["mediadorNombre"].fillna("Sin nombre")
    df = df.drop_duplicates(subset="id")
    return df.reset_index(drop=True)
