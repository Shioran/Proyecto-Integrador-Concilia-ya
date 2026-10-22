import os

import matplotlib
matplotlib.use("Agg")  # sin ventana: solo guarda PNG (funciona también en servidor/VM sin pantalla)
import matplotlib.pyplot as plt
import seaborn as sns

# Carpeta de salida. Por defecto: <Proyecto Integrador>/salida/graficos
# Se puede cambiar con la variable de entorno GRAFICOS_DIR
# (p. ej. apuntarla a "Front - Project/public/graficos" si se quiere servir desde el frontend).
RUTA_ASSETS = os.getenv(
    "GRAFICOS_DIR",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "salida", "graficos"),
)


def crear_ruta_si_no_existe(ruta_destino):
    os.makedirs(ruta_destino, exist_ok=True)


def _vacio(datos, titulo):
    """Con una BD recién creada puede no haber datos: se avisa y se sigue, sin romper el pipeline."""
    if datos is None or len(datos) == 0:
        print(f"⚠ Sin datos para «{titulo}»: gráfico omitido.")
        return True
    return False


def _guardar(figura, ruta_destino, nombre_archivo, etiqueta):
    ruta_completa = os.path.abspath(os.path.join(ruta_destino, nombre_archivo))
    figura.savefig(ruta_completa, dpi=150)
    plt.close(figura)
    print(f"{etiqueta} guardado en: {ruta_completa}")


def graficar_lineas(datos_agrupados, columna_eje_x, columna_eje_y,
                    titulo="Gráfico de líneas", color_linea="#2196F3",
                    nombre_archivo="lineas.png", ruta_destino=RUTA_ASSETS):
    if _vacio(datos_agrupados, titulo):
        return
    crear_ruta_si_no_existe(ruta_destino)
    figura, area_dibujo = plt.subplots(figsize=(10, 5))
    area_dibujo.plot(datos_agrupados[columna_eje_x], datos_agrupados[columna_eje_y],
                     marker="o", color=color_linea, linewidth=2)
    area_dibujo.set_title(titulo, fontsize=14)
    area_dibujo.set_xlabel(columna_eje_x, fontsize=12)
    area_dibujo.set_ylabel(columna_eje_y, fontsize=12)
    area_dibujo.grid(True, linestyle="--", alpha=0.6)
    plt.xticks(rotation=45)
    plt.tight_layout()
    _guardar(figura, ruta_destino, nombre_archivo, "Gráfico de líneas")


def graficar_barras(datos_agrupados, columna_categorias, columna_valores,
                    titulo="Gráfico de barras", color_barras="#4CAF50",
                    nombre_archivo="barras.png", ruta_destino=RUTA_ASSETS):
    if _vacio(datos_agrupados, titulo):
        return
    crear_ruta_si_no_existe(ruta_destino)
    figura, area_dibujo = plt.subplots(figsize=(10, 5))
    barras = area_dibujo.bar(datos_agrupados[columna_categorias].astype(str),
                             datos_agrupados[columna_valores],
                             color=color_barras, edgecolor="black")
    area_dibujo.bar_label(barras, fmt="%.0f")
    area_dibujo.set_title(titulo, fontsize=14)
    area_dibujo.set_xlabel(columna_categorias, fontsize=12)
    area_dibujo.set_ylabel(columna_valores, fontsize=12)
    plt.xticks(rotation=45)
    plt.tight_layout()
    _guardar(figura, ruta_destino, nombre_archivo, "Gráfico de barras")


def graficar_torta(datos_agrupados, columna_etiquetas, columna_valores,
                   titulo="Gráfico de torta", lista_colores=None,
                   nombre_archivo="torta.png", ruta_destino=RUTA_ASSETS):
    if _vacio(datos_agrupados, titulo):
        return
    crear_ruta_si_no_existe(ruta_destino)
    if lista_colores is None:
        lista_colores = sns.color_palette("Set2", len(datos_agrupados))
    figura, area_dibujo = plt.subplots(figsize=(8, 8))
    area_dibujo.pie(
        datos_agrupados[columna_valores],
        labels=datos_agrupados[columna_etiquetas].astype(str),
        autopct="%1.1f%%",
        colors=lista_colores,
        startangle=90,
        wedgeprops={"edgecolor": "black", "linewidth": 0.5},
    )
    area_dibujo.set_title(titulo, fontsize=14)
    plt.tight_layout()
    _guardar(figura, ruta_destino, nombre_archivo, "Gráfico de torta")


def graficar_mapa_calor(datos_agrupados, columna_filas, columna_columnas, columna_valores,
                        titulo="Mapa de calor", paleta_color="YlOrRd",
                        nombre_archivo="mapa_calor.png", ruta_destino=RUTA_ASSETS):
    if _vacio(datos_agrupados, titulo):
        return
    crear_ruta_si_no_existe(ruta_destino)
    tabla_pivote = datos_agrupados.pivot_table(
        index=columna_filas, columns=columna_columnas, values=columna_valores,
        aggfunc="sum", fill_value=0,
    )
    figura, area_dibujo = plt.subplots(figsize=(10, 6))
    sns.heatmap(tabla_pivote, annot=True, fmt=".0f", cmap=paleta_color, ax=area_dibujo,
                linewidths=0.5, linecolor="gray")
    area_dibujo.set_title(titulo, fontsize=14)
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()
    _guardar(figura, ruta_destino, nombre_archivo, "Mapa de calor")
