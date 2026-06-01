import json
from google import genai
from google.genai import types 
from rest_framework.exceptions import ValidationError
from ..models import AIAssistant, Lesson

GEMINI_KEY = "AQ.Ab8RN6Im9qUH8rh3AXklmTj8yBJSBoNVWBQw2A0EVBiN6KqHhw"

class LessonService:
    @staticmethod
    def processar_ia_da_aula(lesson: Lesson):
        texto_material = getattr(lesson, "content", "") or getattr(lesson, "description", "")
        if not texto_material or len(texto_material.strip()) < 10:
            raise ValidationError({"error": "Esta aula não possui material suficiente para a IA."})

        prompt = f"Gere um resumo detalhado e 5 questões de múltipla escolha (A, B, C, D, indicando a correta) em formato JSON estrito sobre: {texto_material}. Estrutura esperada: {{'resumo': '...', 'questoes': [{{'enunciado': '...', 'alternativas': {{'A': '...'}}, 'resposta_correta': 'A'}}]}}"

        client = genai.Client(api_key=GEMINI_KEY)
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",  
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json", 
                temperature=0.3
            )
        )
        dados = json.loads(response.text)

        ai_content, _ = AIAssistant.objects.get_or_create(lesson=lesson)
        ai_content.summary = dados.get("resumo", "")
        ai_content.quiz_json = {"questions": dados.get("questoes", [])}
        ai_content.save()
        
        return ai_content
    
    @staticmethod
    def responder_duvida_da_aula(lesson: Lesson, pergunta_aluno: str):
        """
        Envia a dúvida do aluno para o Gemini junto com o material da aula
        para que ele responda como um tutor especializado.
        """
        texto_material = getattr(lesson, "content", "") or getattr(lesson, "description", "")
        
        prompt = f"""
        Você é um tutor cognitivo e assistente virtual de uma plataforma de ensino.
        O aluno está assistindo à aula "{lesson.title}" e enviou uma dúvida.
        
        Use o material didático da aula fornecido abaixo como contexto principal. 
        Caso o material abaixo seja curto ou não traga todos os detalhes teóricos sobre o tema, utilize seu próprio conhecimento especializado sobre o assunto da aula ("{lesson.title}") para dar uma resposta completa, robusta e profunda.

        Material Didático da Aula:
        \"\"\"{texto_material}\"\"\"

        Pergunta do Aluno:
        "{pergunta_aluno}"

        Instruções de resposta: Responda diretamente ao aluno, mantenha um tom encorajador. Se o aluno fugir completamente do assunto da aula (pedindo códigos de programação, piadas ou assuntos aleatórios), reforce amigavelmente o foco na disciplina atual.
        """

        client = genai.Client(api_key=GEMINI_KEY)
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt,
        )
        
        return response.text