import json
import time
from rest_framework import status
from rest_framework.exceptions import ValidationError
from google.genai import types

from ..models import Flashcard, UserFlashcardProgress
from ..serializers import FlashcardSerializer
from .base import BaseAIService
from .ai_quiz_service import LessonAIService


class FlashcardAISchema(BaseModel):
    front: str = Field(description="Pergunta, conceito ou termo principal a ser testado na frente do card (curto e objetivo)")
    back: str = Field(description="Resposta, explicação ou definição completa que responde ao verso do card")


class FlashcardService(BaseAIService):

    @staticmethod
    def gerar_flashcards_da_aula(lesson, user=None):
        flashcards_existentes = Flashcard.objects.filter(lesson=lesson)
        if flashcards_existentes.exists():
            serializer = FlashcardSerializer(flashcards_existentes, many=True)
            return serializer.data, status.HTTP_200_OK

        texto_material = LessonAIService.obter_contexto_da_aula(lesson)

        curso = lesson.module.course if lesson.module else None
        categoria_nome = curso.category.name if (curso and curso.category) else "Geral"
        titulo_curso = curso.title if curso else "Curso Geral"

        if not texto_material or len(texto_material.strip()) < 10:
            texto_material = (
                f"Esta é uma aula intitulada '{lesson.title}' pertencente ao curso '{titulo_curso}' na área de {categoria_nome}. "
                "O objetivo é guiar os estudantes nos conceitos essenciais e práticos sobre este assunto."
            )

        contexto_aluno = ""
        if user and user.is_authenticated:
            historico = StudentPerformance.objects.filter(user=user, lesson=lesson).order_by('-created_at').first()
            topicos_fracos_str = ""
            if historico and historico.weak_topics:
                topicos_fracos_str = f" O aluno errou questões sobre: [{', '.join(historico.weak_topics)}]. Foque nesses pontos fracos."

            idade_str = ""
            if hasattr(user, 'birth_date') and user.birth_date:
                from datetime import date
                hoje = date.today()
                idade = hoje.year - user.birth_date.year - ((hoje.month, hoje.day) < (user.birth_date.month, user.birth_date.day))
                idade_str = f" O aluno tem {idade} anos. Apenas adeque a linguagem e analogias para esta faixa etária."

            contexto_aluno = f"\nPERFIL DO ESTUDANTE:{idade_str}{topicos_fracos_str}"

        prompt = f"""
        Você é um tutor educacional especializado na área de "{categoria_nome}" e na técnica de Repetição Espaçada.
        Com base no material didático da aula "{lesson.title}" (Curso: {titulo_curso}), crie de 3 a 5 flashcards pedagógicos de alta qualidade.
        {contexto_aluno}

        REGRAS RÍGIDAS DE CONTEÚDO:
        1. NUNCA faça perguntas sobre metadados (ex: "Qual o título da aula?", "Quem é o professor?", "Qual o objetivo do curso?").
        2. Foco total na COMPREENSÃO PRÁTICA e CONCEITOS CHAVE da matéria ({categoria_nome}):
           - "Para que serve / como funciona o conceito X?"
           - "Qual a diferença entre X e Y?"
           - "Como resolver ou aplicar X na prática?"
        3. A frente ('front') deve ser uma pergunta ou desafio objetivo para testar o conhecimento.
        4. O verso ('back') deve trazer a resposta direta, clara e adequada à faixa etária do estudante.

        Material Didático da Aula:
        \"\"\"{texto_material}\"\"\"
        """

        client = FlashcardService._obter_cliente_gemini()
        modelos = ["gemini-2.5-flash", "gemini-3.5-flash-lite"]

        for modelo in modelos:
            for tentativa in range(3):
                try:
                    response = client.models.generate_content(
                        model=modelo,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            response_mime_type="application/json",
                            response_schema=FlashcardAISchema,
                            temperature=0.3
                        )
                    )
                    dados = json.loads(response.text)
                    lista_flashcards = dados.get("flashcards", [])

                    if not lista_flashcards:
                        break

                    flashcards_criados = []
                    for item in lista_flashcards:
                        card = Flashcard.objects.create(
                            lesson=lesson,
                            front=item.get("front", ""),
                            back_main=item.get("back", ""),
                            back_analogy=""
                        )
                        
                        if user and user.is_authenticated:
                            UserFlashcardProgress.objects.get_or_create(
                                user=user,
                                flashcard=card,
                                defaults={'status': 'novo'}
                            )

                        flashcards_criados.append(card)

                    serializer = FlashcardSerializer(flashcards_criados, many=True)
                    return serializer.data, status.HTTP_201_CREATED

                except ResourceExhausted as e:
                    break
                except APIError as e:
                    if "503" in str(e) or "UNAVAILABLE" in str(e):
                        time.sleep((tentativa + 1) * 2)
                        continue
                    break
                except (json.JSONDecodeError, Exception):
                    break

        raise ValidationError({"error": "Falha na comunicação com o serviço de IA para geração dos Flashcards."})