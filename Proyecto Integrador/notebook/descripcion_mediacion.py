def describir_mediacion(df):
    print("\n--- DESCRIPCIÓN: Mediacion ---")
    print(f"Registros limpios: {len(df)}")
    print(f"Columnas: {list(df.columns)}")
    print(df[["resultado", "lugar", "activo"]].value_counts().to_string())
