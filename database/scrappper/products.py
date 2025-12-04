import requests
from bs4 import BeautifulSoup
import json

# URL da Wiki oficial (Fandom)
url = "https://bindingofisaacrebirth.fandom.com/wiki/Items"

try:
    print("🌍 Conectando ao Wiki de Isaac...")
    response = requests.get(url)
    response.raise_for_status()
except requests.exceptions.RequestException as e:
    print(f"❌ Erro ao conectar: {e}")
    exit()

soup = BeautifulSoup(response.content, "html.parser")

# Busca todas as tabelas com a classe 'wikitable'
tables = soup.find_all("table", class_="wikitable")

if not tables:
    print("❌ Nenhuma tabela encontrada!")
    exit()

print(f"✅ {len(tables)} tabelas encontradas. Processando as principais...\n")

all_items = []

# Loop pelas tabelas encontradas
for index, table in enumerate(tables):

    # Lógica para identificar o tipo baseado na ordem da página
    # 0 = Active Items, 1 = Passive Items
    if index == 0:
        item_type = "Active"
    elif index == 1:
        item_type = "Passive"
    else:
        # Se quiser parar após as duas primeiras, descomente a linha abaixo:
        break
        # item_type = "Other" # Caso queira pegar trinkets ou outras tabelas depois

    print(f"🔄 Processando tabela {index + 1}: {item_type} Items...")

    rows = table.find_all("tr")

    if not rows:
        continue

    # Pega os cabeçalhos (Ex: Name, Icon, Description...)
    headers = [th.get_text(strip=True) for th in rows[0].find_all(["th", "td"])]

    # Tratamento caso haja colunas sem nome
    headers = [h if h else f"Col_{i}" for i, h in enumerate(headers)]

    # Itera sobre as linhas de dados (pulando o cabeçalho)
    for row in rows[1:]:
        cols = row.find_all(["td", "th"])
        col_data = []

        # Itera sobre cada célula da linha
        for col_idx, col in enumerate(cols):

            # Pega o nome do header correspondente para saber se é a coluna de ícone
            # (Segurança: verifica se o índice existe em headers)
            current_header = headers[col_idx] if col_idx < len(headers) else ""

            # --- AQUI ESTÁ A DICA DE OURO ---
            # Se a coluna for "Icon", extraímos a URL da imagem em vez do texto
            if "Icon" in current_header:
                img_tag = col.find("img")
                if img_tag:
                    # O Fandom costuma usar 'data-src' para lazy loading. Se não tiver, pega 'src'.
                    raw_url = img_tag.get("data-src") or img_tag.get("src")

                    if raw_url:
                        # Limpeza da URL: Remove tudo depois de "/revision" para pegar a imagem original
                        # Ex: imagem.png/revision/latest/scale-to-width... -> imagem.png
                        clean_url = raw_url.split("/revision")[0]
                        col_data.append(clean_url)
                    else:
                        col_data.append(None)
                else:
                    col_data.append(None)

            # Se não for ícone, pega o texto normal
            else:
                text = col.get_text(" ", strip=True)
                col_data.append(text)

        # Monta o objeto se o número de colunas bater
        # (As vezes as tabelas têm células mescladas, ignoramos linhas quebradas por segurança)
        if len(col_data) == len(headers):
            item = dict(zip(headers, col_data))

            # Adiciona campos extras úteis para o seu sistema
            item['type'] = item_type # Active ou Passive

            # Renomeia a chave do ícone para algo mais amigável pro banco de dados (opcional)
            if "Icon" in item:
                item['image_url'] = item.pop("Icon")

            all_items.append(item)

# Salva em JSON
output_file = "isaac_items_full.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(all_items, f, ensure_ascii=False, indent=2)

print(f"\n🚀 Sucesso! {len(all_items)} itens extraídos.")
print(f"💾 Dados salvos em '{output_file}'. Agora é só criar o seed no Adonis!")
