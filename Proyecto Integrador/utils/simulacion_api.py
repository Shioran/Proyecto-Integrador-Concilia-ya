"""
Genera datos de prueba con EXACTAMENTE la forma aplanada del contrato FASE1_API.md.
Los usa utils/mock_backend.py (backend de mentira para ensayar sin MySQL ni Spring Boot).
Incluye un poco de "ruido" controlado (espacios, correos en mayúscula, duplicados, tipoDocumento
nulo) para que la capa de limpieza tenga algo que hacer.
"""
import random as rd
from datetime import datetime, timedelta

LUGARES = ["Oficina Central Piso 2", "Sala Virtual Zoom", "Sede Norte Sala A", "Sede Sur Sala B", None]
NOMBRES = ["María", "Juan", "Carlos", "Ana", "Luis", "Sofía", "Pedro", "Laura", "Camila", "Andrés"]
APELLIDOS = ["González", "Rodríguez", "Pérez", "Gómez", "López", "Martínez", "Restrepo", "Ospina"]


def _iso(dt):
    return dt.strftime("%Y-%m-%dT%H:%M:%S") if dt else None


def generar_datos(n_usuarios=80, n_conflictos=250, semilla=42):
    rd.seed(semilla)
    perfiles = [
        {"id": 1, "nombre": "Administrador", "descripcion": "Acceso total", "activo": True},
        {"id": 2, "nombre": "Mediador", "descripcion": "Gestiona mediaciones", "activo": True},
        {"id": 3, "nombre": "Usuario", "descripcion": "Registra conflictos", "activo": True},
    ]
    estados = [
        {"id": 1, "nombre": "Abierto", "codigo": "ABIERTO", "descripcion": "Pendiente de mediador", "activo": True},
        {"id": 2, "nombre": "En mediación", "codigo": "EN_MEDIACION", "descripcion": "Con mediador asignado", "activo": True},
        {"id": 3, "nombre": "Resuelto", "codigo": "RESUELTO", "descripcion": "Cerrado con acuerdo", "activo": True},
        {"id": 4, "nombre": "Cerrado", "codigo": "CERRADO", "descripcion": "Cerrado sin acuerdo", "activo": True},
    ]
    tipos = [
        {"id": 1, "nombre": "Pago", "descripcion": "Deudas y pagos pendientes", "activo": True},
        {"id": 2, "nombre": "Contrato", "descripcion": "Incumplimiento contractual", "activo": True},
        {"id": 3, "nombre": "Servicio", "descripcion": "Falla en un servicio", "activo": True},
        {"id": 4, "nombre": "Laboral", "descripcion": "Conflictos de trabajo", "activo": True},
        {"id": 5, "nombre": "Vecinal", "descripcion": "Convivencia (en desuso)", "activo": False},
    ]

    # ---- usuarios: 1 admin, 5 mediadores, el resto perfil Usuario
    usuarios, base = [], datetime(2026, 3, 1)
    for i in range(1, n_usuarios + 1):
        perfil_id = 1 if i == 1 else (2 if i <= 6 else 3)
        n, a = rd.choice(NOMBRES), rd.choice(APELLIDOS)
        usuarios.append({
            "id": i, "nombre": n, "apellido": a,
            "tipoDocumento": rd.choice(["CC", "CC", "CE", "NIT", "PASAPORTE"]),
            "documento": str(rd.randint(10_000_000, 1_999_999_999)),
            "correo": f"{n.lower()}.{a.lower()}{i}@conciliaya.test".replace("í", "i").replace("é", "e")
                      .replace("á", "a").replace("ó", "o").replace("ñ", "n"),
            "telefono": f"+57 300 {rd.randint(1000000, 9999999)}",
            "perfilId": perfil_id,
            "activo": rd.random() > 0.08,
            "fechaAlta": _iso(base + timedelta(days=rd.randint(0, 200))),
        })
    mediadores = [u for u in usuarios if u["perfilId"] == 2]
    partes = [u for u in usuarios if u["perfilId"] == 3]

    # ---- conflictos y mediaciones coherentes con las reglas de negocio
    conflictos, mediaciones = [], []
    for cid in range(1, n_conflictos + 1):
        dem, ddo = rd.sample(partes, 2)
        tipo = rd.choice(tipos[:4])
        inicio = datetime(2026, 3, 1) + timedelta(days=rd.randint(0, 220), hours=rd.randint(0, 23))
        r = rd.random()
        cancelado = r < 0.05
        estado = "ABIERTO" if cancelado else (
            "ABIERTO" if r < 0.30 else "EN_MEDIACION" if r < 0.55 else "RESUELTO" if r < 0.80 else "CERRADO")
        nombre_estado = next(e["nombre"] for e in estados if e["codigo"] == estado)

        conf = {
            "id": cid, "demandanteId": dem["id"], "demandadoId": ddo["id"],
            "tipoConflictoNombre": tipo["nombre"], "estadoConflictoNombre": nombre_estado,
            "asunto": f"Caso {cid}: {tipo['nombre'].lower()}",
            "descripcion": "Descripción del caso." if rd.random() > 0.2 else None,
            "montoReclamado": round(rd.uniform(200_000, 30_000_000), 2) if rd.random() > 0.1 else None,
            "fechaInicio": _iso(inicio), "fechaCierre": None, "resultado": None,
            "activo": not cancelado, "fechaAlta": _iso(inicio),
            "mediadorId": None, "mediadorNombre": None,
        }

        if estado != "ABIERTO":
            med = rd.choice(mediadores)
            programada = inicio + timedelta(days=rd.randint(3, 20))
            resultado = {"RESUELTO": "ACUERDO", "CERRADO": "SIN_ACUERDO"}.get(estado)
            conf.update(mediadorId=med["id"], mediadorNombre=f"{med['nombre']} {med['apellido']}", resultado=resultado)
            if resultado:
                conf["fechaCierre"] = _iso(programada + timedelta(days=rd.randint(1, 15)))
            mediaciones.append({
                "id": len(mediaciones) + 1, "conflictoId": cid,
                "mediadorId": med["id"], "mediadorNombre": f"{med['nombre']} {med['apellido']}",
                "estadoCodigo": estado, "estadoNombre": nombre_estado,
                "fechaProgramada": _iso(programada) if rd.random() > 0.05 else None,
                "lugar": rd.choice(LUGARES),
                "observaciones": "Sesión registrada." if rd.random() > 0.4 else None,
                "resultado": resultado, "fechaRegistro": _iso(inicio + timedelta(days=1)),
                "activo": resultado is None,
            })
        conflictos.append(conf)

    # ---- ruido controlado (lo que la capa de limpieza debe corregir)
    for u in rd.sample(usuarios, 4):
        u["tipoDocumento"] = None
    for u in rd.sample(usuarios, 4):
        u["correo"] = "  " + u["correo"].upper() + " "
    for c in rd.sample(conflictos, 3):
        c["asunto"] = "  " + c["asunto"] + "  "
    usuarios.extend(dict(u) for u in rd.sample(usuarios, 2))       # duplicados por id
    conflictos.extend(dict(c) for c in rd.sample(conflictos, 3))

    return {"perfiles": perfiles, "estados": estados, "tipos": tipos,
            "usuarios": usuarios, "conflictos": conflictos, "mediaciones": mediaciones}
