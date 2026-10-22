def describir_conflicto(df):
    print("\n--- DESCRIPCIÓN: Conflicto ---")
    print(f"Registros limpios: {len(df)}")
    print(f"Columnas: {list(df.columns)}")
    print(df[["tipoConflictoNombre", "estadoConflictoNombre", "activo"]].value_counts().to_string())
    con_monto = df["montoReclamado"].dropna()
    if con_monto.empty:
        print("\nMonto reclamado: ningún conflicto lo informó (es opcional).")
    else:
        print(f"\nMonto reclamado ({len(con_monto)} de {len(df)} conflictos lo informaron) - "
              f"promedio: ${con_monto.mean():,.2f}  |  max: ${con_monto.max():,.2f}")
