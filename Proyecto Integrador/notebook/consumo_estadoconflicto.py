from notebook.consumo_api import obtener_cliente


def consumir_estadoconflicto():
    """GET /estados-conflicto (autenticado con JWT). Devuelve la lista de registros ya aplanados por el backend."""
    return obtener_cliente().get("/estados-conflicto")
