import pyarrow.parquet as pq
import pandas as pd

# Fichier Parquet
fichier = "StockEtablissement_utf8.parquet"

# SIREN à rechercher
siren_recherche = "015750961"

# Colonnes à lire (toutes les colonnes si tu veux vraiment tout)
parquet_file = pq.ParquetFile(fichier)
colonnes = parquet_file.schema.names  # Toutes les colonnes du fichier

# Liste pour stocker les résultats
resultats = []

# Lire row group par row group pour optimiser
for i in range(parquet_file.num_row_groups):
    table = parquet_file.read_row_group(i, columns=colonnes)
    df = table.to_pandas()
    
    # Filtrer sur le SIREN
    df_siren = df[df["siren"] == siren_recherche]
    
    if not df_siren.empty:
        resultats.append(df_siren)

# Concaténer les résultats
df_final = pd.concat(resultats, ignore_index=True)

# Afficher le résultat
pd.set_option("display.max_columns", None)
print(df_final)

# Exporter dans un CSV si besoin
df_final.to_csv(f"{siren_recherche}_info.csv", index=False, encoding="utf-8-sig")
