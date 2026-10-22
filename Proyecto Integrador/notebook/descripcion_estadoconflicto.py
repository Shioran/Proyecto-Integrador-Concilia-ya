def describir_estadoConflictos(df):
    print("\n--- DESCRIPCIÓN: EstadoConflicto ---")
    print(f"Registros limpios: {len(df)}")
    print(f"Columnas: {list(df.columns)}")
    print(df[["nombre", "codigo", "activo"]].value_counts().to_string())
