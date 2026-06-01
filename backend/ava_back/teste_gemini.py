import requests
import json

GEMINI_KEY = "AQ.Ab8RN6Im9qUH8rh3AXklmTj8yBJSBoNVWBQw2A0EVBiN6KqHhw"
PROJECT_ID = "973331682934"

# Endpoint oficial para listar o catálogo disponível para a sua chave
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={GEMINI_KEY}"

headers = {
    "Content-Type": "application/json",
    "x-goog-user-project": PROJECT_ID
}

try:
    print("🛰️ Conectando ao ModelService da Google...")
    response = requests.get(url, headers=headers)
    data = response.json()
    
    if response.status_code == 200:
        print("\n🎉 MODELOS ENCONTRADOS NO SEU CATÁLOGO:")
        print("----------------------------------------")
        # Filtra e mostra os nomes dos modelos e quais métodos eles aceitam
        for model in data.get('models', []):
            name = model.get('name')
            methods = model.get('supportedGenerationMethods', [])
            print(f"🤖 Nome: {name}")
            print(f"   Métodos suportados: {methods}\n")
    else:
        print("❌ Erro ao listar:", json.dumps(data, indent=2))

except Exception as e:
    print("💥 Falha na conexão:", str(e))