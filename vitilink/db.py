import pyarrow.parquet as pq
import pandas as pd

# Fichier Parquet
fichier = "StockEtablissement_utf8.parquet"

# Colonnes à lire (tout ce qui peut servir pour l'adresse)
colonnes = [
    "siren",
    "siret",
    "denominationUsuelleEtablissement",
    "activitePrincipaleEtablissement",
    "etatAdministratifEtablissement",
    "codePostalEtablissement",
    "libelleCommuneEtablissement",
    "numeroVoieEtablissement",
    "typeVoieEtablissement",
    "libelleVoieEtablissement",
    "complementAdresseEtablissement"
]

# Codes NAF viticoles
naf_viticole = ["01.21Z", "46.34Z"]
# Auvergne-Rhône-Alpes
departements_auvergne_rhone_alpes = ["01","03","07","15","26","38","42","43","63","69","73","74"]

# Bourgogne-Franche-Comté
departements_bourgogne_franche_comte = ["21","25","39","58","70","71","89","90"]

# Bretagne
departements_bretagne = ["22","29","35","56"]

# Centre-Val de Loire
departements_centre_val_de_loire = ["18","28","36","37","41","45"]

# Corse
departements_corse = ["2A","2B"]

# Grand Est
departements_grand_est = ["08","10","51","52","54","55","57","67","68","88"]

# Hauts-de-France
departements_hauts_de_france = ["02","59","60","62","80"]

# Île-de-France
departements_ile_de_france = ["75","77","78","91","92","93","94","95"]

# Normandie
departements_normandie = ["14","27","50","61","76"]

# Nouvelle-Aquitaine
departements_nouvelle_aquitaine = ["16","17","19","23","24","33","40","47","64","79","86","87"]

# Occitanie
departements_occitanie = ["09","11","12","30","31","32","34","46","48","65","66","81","82"]

# Pays de la Loire
departements_pays_de_la_loire = ["44","49","53","72","85"]

# Provence-Alpes-Côte d'Azur
departements_paca = ["04","05","06","13","83","84"]

# Ouvrir le fichier Parquet
parquet_file = pq.ParquetFile(fichier)
resultats = []

for i in range(parquet_file.num_row_groups):
    table = parquet_file.read_row_group(i, columns=colonnes)
    df = table.to_pandas()
    
    # Filtrer NAF viticole
    df = df[df["activitePrincipaleEtablissement"].isin(naf_viticole)]
    
    # Filtrer départements BFC
    df = df[df["codePostalEtablissement"].str[:2].isin(departements_occitanie)]
    
    # Ne garder que les établissements actifs
    df = df[df["etatAdministratifEtablissement"] == "A"]
    
    resultats.append(df)

# Concaténer tous les morceaux
df_bfc = pd.concat(resultats, ignore_index=True)

# Réorganiser les colonnes pour le CSV
colonnes_finales = [
    "siren",
    "siret",
    "denominationUsuelleEtablissement",
    "numeroVoieEtablissement",
    "typeVoieEtablissement",
    "libelleVoieEtablissement",
    "complementAdresseEtablissement",
    "codePostalEtablissement",
    "libelleCommuneEtablissement",
    "activitePrincipaleEtablissement"
]

df_bfc = df_bfc[colonnes_finales]

# Exporter en CSV séparé par des virgules (chaque info dans sa colonne)
df_bfc.to_csv("etablissements_viticoles_BFC.csv", index=False, encoding="utf-8")

print(df_bfc.head())
print("\nNombre d’établissements viticoles actifs :", len(df_bfc))
