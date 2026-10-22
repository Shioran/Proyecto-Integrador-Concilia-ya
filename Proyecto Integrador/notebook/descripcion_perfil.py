def describir_perfil(df):
    print("\n--- DESCRIPCIÓN: Perfil ---")
    print(f"Registros limpios: {len(df)}")
    print(f"Columnas: {list(df.columns)}")
    print(df[["nombre", "activo"]].value_counts().to_string())
