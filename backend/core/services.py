import os
import json
from google import genai
from google.genai import types

class AIService:
    def __init__(self):
        self.client = genai.Client(api_key="AQ.Ab8RN6JpsJY_f4WcdLrO9r_IAGy3jFWfkFrIzYUc3Ym6phlSNA")
        self.model_name = "models/gemini-1.5-flash"

    def gerar_resumo_e_perguntas(self, texto_material: str):
        """
        Envia o material didático para o Gemini e solicita um resumo estruturado
        junto com um banco de perguntas de múltipla escolha em formato JSON.
        """
        
        prompt = f"""
        Você é um tutor cognitivo especialista em design instrucional. 
        Analise o material didático fornecido abaixo e gere duas coisas:
        1. Um resumo analítico e detalhado do conteúdo, focado nos pontos mais importantes para o aprendizado do estudante.
        2. Um questionário de fixação com 5 questões de múltipla escolha baseadas estritamente no texto fornecido. Cada questão deve ter 4 alternativas (A, B, C, D) e indicar explicitamente qual é a resposta correta.

        Material Didático para análise:
        \"\"\"{texto_material}\"\"\"

        Você DEVE responder estritamente no formato JSON abaixo, sem qualquer texto adicional antes ou depois:
        {{
            "resumo": "Texto longo do resumo aqui estruturado em parágrafos normais...",
            "questoes": [
                {{
                    "enunciado": "Pergunta da questão aqui?",
                    "alternativas": {{
                        "A": "Texto da alternativa A",
                        "B": "Texto da alternativa B",
                        "C": "Texto da alternativa C",
                        "D": "Texto da alternativa D"
                    }},
                    "resposta_correta": "A"
                }}
            ]
        }}
        """

        try:
            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.3, 
            )

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config
            )

            dados_gerados = json.loads(response.text)
            return dados_gerados

        except Exception as e:
            print(f"Erro ao comunicar com a API do Gemini: {e}")
            return {
                "error": "Não foi possível processar o material didático no momento.",
                "detalhes": str(e)
            }