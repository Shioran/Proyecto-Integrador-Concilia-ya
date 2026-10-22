import pandas as pd
from notebook.utilidades_limpieza import asegurar_columnas, a_texto, a_booleano, a_fecha

# GET /api/usuarios (ADMIN)  ->  usuario aplanado con perfilId
# El archivo conserva el nombre original (con el typo) para no romper los imports.

# Respaldo según el contrato (FASE1_API.md): perfil 1=Admin, 2=Mediador, 3=Usuario
PERFILES_BASE = {1: "Administrador", 2: "Mediador", 3: "Usuario"}


def limpiar_usuarios(df_sucio, df_perfiles=None):
    """df_perfiles (opcional): perfiles ya limpios, para traducir perfilId -> nombre."""
    df = asegurar_columnas(
        df_sucio,
        ["id", "nombre", "apellido", "tipoDocumento", "documento", "correo",
         "telefono", "perfilId", "activo", "fechaAlta"],
    )

    # Tolerancia: si el backend enviara el perfil anidado {perfil:{id,nombre}}, se aplana aquí.
    if "perfil" in df.columns:
        anidado = df["perfil"].apply(lambda p: p.get("id") if isinstance(p, dict) else None)
        df["perfilId"] = df["perfilId"].fillna(anidado)
        df = df.drop(columns=["perfil"])

    # 1. Textos
    df["nombre"] = a_texto(df["nombre"])
    df["apellido"] = a_texto(df["apellido"])
    df["tipoDocumento"] = a_texto(df["tipoDocumento"], mayusculas=True).fillna("SIN DATO")
    df["correo"] = a_texto(df["correo"], minusculas=True)
    df["correo"] = df["correo"].where(df["correo"].str.contains("@", na=False), pd.NA)

    # 2. Numéricos, booleanos y fechas
    df["id"] = pd.to_numeric(df["id"], errors="coerce")
    df["perfilId"] = pd.to_numeric(df["perfilId"], errors="coerce")
    df["activo"] = a_booleano(df["activo"], por_defecto=True)
    df["fechaAlta"] = a_fecha(df["fechaAlta"])

    # 3. perfilId -> perfilNombre (catálogo real; si falta, el respaldo del contrato)
    nombres = dict(PERFILES_BASE)
    if df_perfiles is not None and len(df_perfiles):
        nombres.update(dict(zip(df_perfiles["id"].astype(int), df_perfiles["nombre"])))
    df["perfilNombre"] = df["perfilId"].map(lambda i: nombres.get(int(i), f"Perfil {int(i)}")
                                            if pd.notna(i) else pd.NA).astype("string")

    # 4. Reglas de calidad
    df = df[df["id"] > 0]
    df = df.dropna(subset=["id", "correo", "perfilId"])
    df = df.drop_duplicates(subset="id")
    return df.reset_index(drop=True)
