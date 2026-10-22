from notebook.consumo_api import obtener_cliente


def consumir_perfil():
    """GET /perfiles (autenticado con JWT). Devuelve la lista de registros ya aplanados por el backend."""
    return obtener_cliente().get("/perfiles")
