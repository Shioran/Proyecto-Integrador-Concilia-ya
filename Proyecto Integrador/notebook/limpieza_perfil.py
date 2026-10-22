import pandas as pd
from notebook.utilidades_limpieza import asegurar_columnas, a_texto, a_booleano

# GET /api/perfiles  ->  { id, nombre, descripcion, activo }


def limpiar_perfil(df_sucio):
    df = asegurar_columnas(df_sucio, ["id", "nombre", "descripcion", "activo"])

    df["nombre"] = a_texto(df["nombre"], titulo=True)
    df["descripcion"] = a_texto(df["descripcion"])
    df["id"] = pd.to_numeric(df["id"], errors="coerce")
    df["activo"] = a_booleano(df["activo"], por_defecto=True)

    df = df[df["id"] > 0]
    df = df.dropna(subset=["id", "nombre"])
    df = df.drop_duplicates(subset="id")
    return df.reset_index(drop=True)
