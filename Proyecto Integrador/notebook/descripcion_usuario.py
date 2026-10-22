def describir_usuarios(df):
    print("\n--- DESCRIPCIÓN: Usuario ---")
    print(f"Registros limpios: {len(df)}")
    print(f"Columnas: {list(df.columns)}")
    print(df[["tipoDocumento", "perfilNombre", "activo"]].value_counts().to_string())
