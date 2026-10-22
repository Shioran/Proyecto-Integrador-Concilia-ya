import pandas as pd
from notebook.utilidades_limpieza import (
    asegurar_columnas, a_texto, a_booleano, a_fecha, etiquetar_resultado)

# GET /api/conflictos  ->  ConflictoResponse (YA VIENE APLANADO, no hay objetos anidados):
#   id, demandanteId, demandadoId, tipoConflictoNombre, estadoConflictoNombre, asunto,
#   descripcion, montoReclamado, fechaInicio, fechaCierre, resultado, activo, fechaAlta,
#   mediadorId, mediadorNombre
#
# Reglas del contrato que afectan a la limpieza:
#   - montoReclamado, descripcion, fechaCierre, resultado y mediador son OPCIONALES (pueden ser null)
#   - activo = false  ->  conflicto cancelado (baja lógica)


def limpiar_conflicto(df_sucio):
    df = asegurar_columnas(
        df_sucio,
        ["id", "demandanteId", "demandadoId", "tipoConflictoNombre", "estadoConflictoNombre",
         "asunto", "descripcion", "montoReclamado", "fechaInicio", "fechaCierre", "resultado",
         "activo", "fechaAlta", "mediadorId", "mediadorNombre"],
    )

    # 1. Textos
    for col in ["asunto", "descripcion", "tipoConflictoNombre", "estadoConflictoNombre", "mediadorNombre"]:
        df[col] = a_texto(df[col])
    df["resultado"] = etiquetar_resultado(df["resultado"])  # nulo mientras no haya dictamen

    # 2. Numéricos y booleanos
    for col in ["id", "demandanteId", "demandadoId", "mediadorId", "montoReclamado"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df["montoReclamado"] = df["montoReclamado"].where(df["montoReclamado"] >= 0)  # negativo = inválido
    df["activo"] = a_booleano(df["activo"], por_defecto=True)

    # 3. Fechas (no se inventan: una fecha ausente queda como NaT)
    for col in ["fechaInicio", "fechaCierre", "fechaAlta"]:
        df[col] = a_fecha(df[col])

    # 4. Obligatorias según el contrato
    df = df[df["id"] > 0]
    df = df.dropna(subset=["id", "asunto", "tipoConflictoNombre", "estadoConflictoNombre",
                           "demandanteId", "demandadoId"])
    df = df.drop_duplicates(subset="id")
    return df.reset_index(drop=True)
