import json
import os  
from pathlib import Path
from dotenv import load_dotenv  # <-- Import para ler o .env na marra
from google import genai
from google.genai import types 
from rest_framework.exceptions import ValidationError
from ..models import AIAssistant, Lesson, LessonMaterial 

# Descobre a pasta raiz do projeto e carrega o arquivo .env
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(os.path.join(BASE_DIR, '.env'))

class LessonService:
    @staticmethod
    def obter_contexto_da_aula(lesson: Lesson) -> str:
        """
        Método auxiliar para varrer a nova tabela de materiais de apoio
        e unificar os conteúdos de texto em uma única string para a IA.
        """
        materiais_texto = lesson.materials.filter(material_type='text')
        
        if not materiais_texto.exists():
            return ""
            
        conteudo_completo = []
        for material in materiais_texto:
            if material.raw_content:
                conteudo_completo.append(f"--- Material: {material.title} ---\n{material.raw_content}")
                
        return "\n\n".join(conteudo_completo)

    @staticmethod
    def processar_ia_da_aula(lesson: Lesson):
        texto_material = LessonService.obter_contexto_da_aula(lesson)

        if not texto_material or len(texto_material.strip()) < 10:
            texto_material = f"Esta é uma aula de nível superior intitulada '{lesson.title}'. O foco principal é guiar os estudantes nos conceitos iniciais e fundamentais sobre este assunto dentro do escopo acadêmico."

        prompt = f"""
            Você é um tutor educacional focado em tecnologia e desenvolvimento de sistemas.
            Gere um resumo detalhado e exatamente 3 questões de múltipla escolha em formato JSON estrito sobre o seguinte conteúdo didático:

            {texto_material}

            Regras estritas de resposta:
            1. Responda ÚNICA e EXCLUSIVAMENTE com um objeto JSON válido.
            2. Siga exatamente a estrutura do schema JSON abaixo (com as chaves em inglês para compatibilidade do sistema):

            {{
            "resumo": "Texto detalhado do resumo formatado estruturadamente em Markdown, utilizando tópicos, negritos e parágrafos didáticos.",
            "questions": [
                {{
                "question": "Texto da pergunta de múltipla escolha aqui?",
                "options": ["Texto da opção A", "Texto da opção B", "Texto da opção C", "Texto da opção D"],
                "answer": "Texto exato da opção correta (deve ser idêntico a uma das strings contidas no array 'options')",
                "explanation": "Uma breve explicação pedagógica do porquê essa resposta está correta."
                }}
            ]
            }}
            """

        gemini_key = os.environ.get("GEMINI_API_KEY")
        
        print("\n" + "="*50)
        print(f"DEBUG QUIZ - CHAVE ENCONTRADA: {gemini_key}")
        print("="*50 + "\n")

        if not gemini_key:
            raise ValidationError("A chave GEMINI_API_KEY não foi encontrada no ambiente do servidor.")

        client = genai.Client(api_key=gemini_key)
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
        ai_content.quiz_json = {"questions": dados.get("questions", [])}
        ai_content.save()
        
        return ai_content
    
    @staticmethod
    def responder_duvida_da_aula(lesson: Lesson, pergunta_aluno: str):
        texto_material = LessonService.obter_contexto_da_aula(lesson)
        
        prompt = f"""
        Você é um tutor cognitivo e assistente virtual de uma plataforma de ensino.
        O aluno está assistindo à aula "{lesson.title}" e enviou uma dúvida.
        
        Use o material didático da aula fornecido abaixo como contexto principal.
        Caso o material seja curto ou não traga todos os detalhes teóricos, utilize seu próprio conhecimento especializado sobre o assunto da aula ("{lesson.title}") para dar uma resposta completa, robusta e profunda.

        Material Didático da Aula:
        \"\"\"{texto_material}\"\"\"

        Pergunta do Aluno:
        "{pergunta_aluno}"

        Instruções de resposta: Responda diretamente ao aluno, mantenha um tom encorajador. Se o aluno fugir do assunto da aula (pedindo códigos de programação fora do contexto, piadas ou assuntos aleatórios), reforce amigavelmente o foco na disciplina atual.
        """

        gemini_key = os.environ.get("GEMINI_API_KEY")

        if not gemini_key:
            raise ValidationError("A chave GEMINI_API_KEY não foi encontrada no ambiente do servidor.")

        client = genai.Client(api_key=gemini_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        
        return response.text