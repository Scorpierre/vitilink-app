import pandas as pd
import json
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# --- Variables ---
CSV_FILE = "bourgogne.csv"
OUTPUT_FILE = "bourgogne_updated.csv"
COOKIES_FILE = "cookies_pappers.json"

df = pd.read_csv(CSV_FILE, sep=",", dtype=str, encoding='latin1')

# --- Charger les cookies ---
with open(COOKIES_FILE, "r") as f:
    cookies = json.load(f)

# --- Lancer Selenium ---
options = webdriver.ChromeOptions()
options.add_argument("--start-maximized")
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

# --- Aller sur Pappers pour initialiser le domaine ---
driver.get("https://www.pappers.fr")
time.sleep(2)

# --- Ajouter les cookies ---
for cookie in cookies:
    cookie.pop("sameSite", None)
    driver.add_cookie(cookie)

# --- Ajouter les colonnes si elles n'existent pas ---
for col in ["link", "mail", "tel"]:
    if col not in df.columns:
        df[col] = ""

# --- Boucle sur chaque SIREN ---
for idx, row in df.iterrows():
    siren = str(row["siren"]).strip()
    url = f"https://www.pappers.fr/entreprise/{siren}"
    driver.get(url)
    time.sleep(3)

    website = ""
    email = ""
    tel = ""

    try:
        # Site internet
        try:
            website_el = driver.find_element("xpath", "//th[contains(text(),'Site internet')]/following-sibling::td/span")
            website = website_el.text.strip()
            if website != "Non disponible":
                df.at[idx, "link"] = str(website)
        except:
            pass

        # Email
        try:
            email_el = driver.find_element("xpath", "//th[contains(text(),'Email')]/following-sibling::td/span")
            email = email_el.text.strip()
            if email != "Non disponible":
                df.at[idx, "mail"] = str(email)
        except:
            pass

        # Téléphone
        try:
            tel_el = driver.find_element("xpath", "//th[contains(text(),'Téléphone')]/following-sibling::td/span")
            tel = tel_el.text.strip()
            if tel != "Non disponible":
                df.at[idx, "tel"] = str(tel)
        except:
            pass

        print(f"Ligne {idx+1}: SIREN {siren} → trouvé info")

    except Exception as e:
        print(f"Ligne {idx+1}: SIREN {siren} → erreur : {e}")

    # --- Sauvegarde après CHAQUE ligne ---
    df.to_csv(OUTPUT_FILE, index=False)

# --- Fin ---
driver.quit()
print("Scraping terminé. Fichier sauvegardé :", OUTPUT_FILE)
