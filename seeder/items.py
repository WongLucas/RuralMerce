import requests
from bs4 import BeautifulSoup
import json

url = "https://bindingofisaacrebirth.fandom.com/wiki/Items"
response = requests.get(url)
response.raise_for_status()

soup = BeautifulSoup(response.content, "html.parser")

# Encontra a tabela principal de itens
table = soup.find("table")

if not table:
    print("❌ Nenhuma tabela encontrada!")
    exit()

rows = table.find_all("tr")
print(f"✅ {len(rows)} linhas encontradas na tabela de itens.\n")

items = []
headers = [th.get_text(strip=True) for th in rows[0].find_all("th")]

# Percorre as linhas de dados (ignorando o cabeçalho)
for i, row in enumerate(rows[1:], start=1):
    cols = row.find_all(["td", "th"])
    col_data = []

    for col in cols:
        # Remove tags internas e junta o texto (incluindo links)
        text = col.get_text(" ", strip=True)
        col_data.append(text)

    # Garante que o número de colunas seja compatível
    if len(col_data) == len(headers):
        item = dict(zip(headers, col_data))
        items.append(item)

    # Mostra as primeiras linhas no console
    if i <= 5:
        print(f"Linha {i}: {' | '.join(col_data)}\n")

# Salva os dados em JSON
with open("items.json", "w", encoding="utf-8") as f:
    json.dump(items, f, ensure_ascii=False, indent=2)

print(f"💾 Arquivo 'items.json' criado com {len(items)} itens.")
