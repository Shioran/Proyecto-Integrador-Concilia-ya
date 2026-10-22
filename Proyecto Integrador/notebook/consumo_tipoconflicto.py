from notebook.consumo_api import obtener_cliente


def consumir_tipo_conflicto():
    """GET /tipos-conflicto (autenticado con JWT). Devuelve la lista de registros ya aplanados por el backend."""
    return obtener_cliente().get("/tipos-conflicto")
