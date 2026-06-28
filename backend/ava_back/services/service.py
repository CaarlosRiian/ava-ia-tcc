import json
import os  
from pathlib import Path
from dotenv import load_dotenv  
from google import genai
from google.genai import types 
from rest_framework.exceptions import ValidationError
from ..models import AIAssistant, Lesson, LessonMaterial 
import datetime

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
    
    @staticmethod
    def gerar_html_certificado(user, course) -> str:
        from ..models import Lesson, LessonProgress
        from rest_framework.exceptions import ValidationError
        from django.utils import timezone  # Import do fuso horário correto do Django
        
        total_aulas = Lesson.objects.filter(module__course=course).count()
        aulas_concluidas = LessonProgress.objects.filter(
            user=user,
            lesson__module__course=course,
            completed=True
        ).count()
        
        if total_aulas == 0 or aulas_concluidas < total_aulas:
            raise ValidationError("Você precisa concluir todas as aulas do curso para emitir o certificado.")
            
        nome_bruto = f"{user.first_name} {user.last_name}".strip() or user.username
        aluno_nome = nome_bruto.replace('_', ' ').title()
        
        agora = timezone.localtime(timezone.now())
        data_conclusao = agora.strftime("%d/%m/%Y")
        id_autenticacao = f"AVA-IA-{course.id}{user.id}-{agora.strftime('%Y%m%d')}"

        html_template = f"""
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Certificado de Conclusão - {course.title}</title>
            <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
            <style>
                @page {{ size: landscape; margin: 0; }}
                body {{ font-family: 'Inter', sans-serif; }}
            </style>
        </head>
        <body class="bg-gray-100 flex items-center justify-center min-h-screen p-0 m-0">
            <div class="w-[1123px] h-[794px] bg-white border-[16px] border-blue-900 p-16 flex flex-col justify-between relative shadow-2xl bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
                <div class="absolute right-16 top-16 opacity-10">
                    <svg width="200" height="200" viewBox="0 0 100 100" fill="currentColor" class="text-blue-900">
                        <polygon points="50,0 63,35 100,35 70,57 81,95 50,75 19,95 30,57 0,35 37,35"/>
                    </svg>
                </div>
                <div class="text-center">
                    <span class="text-blue-900 font-black tracking-widest text-xs uppercase">Plataforma de Ensino AVA-IA</span>
                    <h1 class="text-4xl font-serif font-bold text-gray-800 mt-2">CERTIFICADO DE CONCLUSÃO</h1>
                    <div class="w-24 h-1 bg-amber-500 mx-auto mt-4"></div>
                </div>
                <div class="text-center my-8 px-12">
                    <p class="text-gray-500 text-lg font-medium tracking-wide">Certificamos que o estudante</p>
                    <h2 class="text-4xl font-bold text-blue-950 my-5 tracking-wide font-sans">{aluno_nome}</h2>
                    <p class="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
                        concluiu com êxito todas as etapas teóricas, avaliações adaptativas e atividades propostas no curso de 
                        <strong class="text-gray-900 font-bold">{course.title}</strong>, cumprindo com excelência todos os requisitos acadêmicos da plataforma.
                    </p>
                </div>
                <div class="flex justify-between items-end border-t border-gray-100 pt-8">
                    <div class="text-left text-sm text-gray-400">
                        <p>Emitido em: {data_conclusao}</p>
                        <p class="text-xs mt-1">ID: {id_autenticacao}</p>
                    </div>
                    <div class="text-center">
                        <div class="w-48 border-b border-gray-400 mx-auto mb-2"></div>
                        <p class="text-sm font-medium text-gray-700">Coordenação Acadêmica AVA-IA</p>
                        <p class="text-xs text-gray-400">Emissão Digital via IA Generativa</p>
                    </div>
                </div>
            </div>
            <script>window.onload = function() {{ window.print(); }}</script>
        </body>
        </html>
        """
        return html_template