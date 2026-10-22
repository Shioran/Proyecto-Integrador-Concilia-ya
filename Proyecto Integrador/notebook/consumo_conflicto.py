from notebook.consumo_api import obtener_cliente


def consumir_conflicto():
    """GET /conflictos (autenticado con JWT). Devuelve la lista de registros ya aplanados por el backend."""
    return obtener_cliente().get("/conflictos")
