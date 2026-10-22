"""Funciones comunes de limpieza (las usan todos los limpieza_*.py)."""
import pandas as pd

# Resultados que devuelve el backend -> etiqueta legible para los gráficos
ETIQUETA_RESULTADO = {"ACUERDO": "Acuerdo", "SIN_ACUERDO": "Sin acuerdo"}


def asegurar_columnas(df, columnas):
    """Si la API no envía una columna (o la lista llega vacía) la crea con nulos,
    para que el resto del pipeline nunca falle por un KeyError."""
    df = df.copy()
    for col in columnas:
        if col not in df.columns:
            df[col] = pd.NA
    return df


def a_texto(serie, mayusculas=False, minusculas=False, titulo=False):
    s = serie.astype("string").str.strip()
    s = s.where(s != "", pd.NA)
    if mayusculas:
        s = s.str.upper()
    if minusculas:
        s = s.str.lower()
    if titulo:
        s = s.str.title()
    return s


def a_booleano(serie, por_defecto=None):
    s = serie.map({True: True, False: False, 1: True, 0: False})
    if por_defecto is not None:
        s = s.fillna(por_defecto)
    return s.astype("boolean")


def a_fecha(serie):
    """Fechas ISO-8601 del backend (con o sin fracción / zona) -> datetime sin zona horaria."""
    f = pd.to_datetime(serie, format="ISO8601", errors="coerce", utc=True)
    return f.dt.tz_localize(None)


def etiquetar_resultado(serie, relleno=None):
    """ACUERDO / SIN_ACUERDO -> 'Acuerdo' / 'Sin acuerdo'. Nulo -> `relleno` (si se indica)."""
    s = a_texto(serie, mayusculas=True)
    s = s.map(lambda v: ETIQUETA_RESULTADO.get(v, v.replace("_", " ").capitalize())
              if isinstance(v, str) else pd.NA).astype("string")
    if relleno is not None:
        s = s.fillna(relleno)
    return s
