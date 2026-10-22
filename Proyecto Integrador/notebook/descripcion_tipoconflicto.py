def describir_tipoConflicto(df):
    print("\n--- DESCRIPCIÓN: TipoConflicto ---")
    print(f"Registros limpios: {len(df)}")
    print(f"Columnas: {list(df.columns)}")
    print(df[["nombre", "activo"]].value_counts().to_string())
