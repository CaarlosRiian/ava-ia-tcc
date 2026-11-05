import json
import time
from google.genai import types
from google.genai.errors import APIError
from google.api_core.exceptions import ResourceExhausted
from rest_framework.response import Response
from rest_framework import status
from pydantic import BaseModel, Field

from ..models import Lesson, LessonChallenge, StudentChallengeSubmission
from .ai_service import LessonAIService

class ChallengeFeedbackSchema(BaseModel):
    feedback_curto: str = Field(description="Feedback construtivo de 1 ou 2 frases sobre a resposta do aluno.")
    prompt_pesquisa: str = Field(description="Um comando curto de aprofundamento para o chat de IA.")
    score_percentage: float = Field(description="Nota de 0.0 a 100.0 avaliando a qualidade técnica da resposta.")

class ChallengeService:

    @staticmethod
    def handle_get_challenge(lesson: Lesson):
        print(f"\n[DEBUG] Buscando desafio para a aula ID: {lesson.id} ({lesson.title})")
        try:
            challenge = lesson.challenge
        except LessonChallenge.DoesNotExist:
            challenge = None
        
        if not challenge:
            print(f"[DEBUG] Nenhum desafio encontrado para a aula {lesson.id}.")
            return Response({"detail": "Nenhum desafio prático cadastrado para esta aula."}, status=status.HTTP_404_NOT_FOUND)
            
        print(f"[DEBUG] Desafio encontrado com ID: {challenge.id}")
        return Response({
            "id": challenge.id,
            "title": getattr(challenge, 'title', 'Desafio Prático'),
            "description": challenge.description,
            "taxonomy_level": getattr(challenge, 'taxonomy_level', 'analisar'),
            "taxonomy_level_display": challenge.get_taxonomy_level_display() if hasattr(challenge, 'get_taxonomy_level_display') else "Prático"
        }, status=status.HTTP_200_OK)

    @staticmethod
    def handle_submit_challenge_action(user, lesson: Lesson, answer_text: str):
        print(f"\n[DEBUG] === INÍCIO SUBMISSÃO DE DESAFIO ===")
        print(f"[DEBUG] Aluno: {user.username} | Aula ID: {lesson.id} - {lesson.title}")
        print(f"[DEBUG] Texto da resposta recebido: '{answer_text}'")

        if not answer_text:
            print("[DEBUG] ERRO: A resposta do aluno veio vazia.")
            return {"error": "A resposta não pode estar vazia."}, status.HTTP_400_BAD_REQUEST

        try:
            challenge, created = LessonChallenge.objects.get_or_create(
                lesson=lesson,
                defaults={
                    'title': f"Desafio: {lesson.title}",
                    'description': getattr(lesson, 'description', 'Resolva o desafio prático proposto para esta aula.'),
                    'evaluation_criteria': 'Avalie a lógica e a sintaxe de forma objetiva.'
                }
            )
            print(f"[DEBUG] Challenge associado ID: {challenge.id} (Foi criado agora? {created})")
        except Exception as e:
            print(f"[DEBUG] EXCEÇÃO ao gerenciar desafio: {str(e)}")
            return {"error": f"Erro interno ao gerenciar o desafio: {str(e)}"}, status.HTTP_500_INTERNAL_SERVER_ERROR

        challenge_desc = getattr(challenge, 'description', None) or getattr(challenge, 'title', 'Desafio prático da aula')

        prompt = f"""
        Você é um assistente técnico sênior e direto ao ponto. 
        Analise a resposta do aluno para o desafio da aula "{lesson.title}".

        Enunciado: {challenge_desc}
        Resposta do Aluno: "{answer_text}"

        REGRAS:
        - Seja extremamente conciso. Sem redações, sem blocos longos de pontos fortes/fracos.
        - Dê um feedback curto de 1 ou 2 frases.
        - Crie um prompt de aprofundamento curto para o chat.
        - Atribua uma porcentagem de nota de 0.0 a 100.0 baseada na qualidade técnica e correção da resposta.
        """

        client = LessonAIService._obter_cliente_gemini() if hasattr(LessonAIService, '_obter_cliente_gemini') else None
        modelos = ["gemini-2.5-flash", "gemini-3.5-flash-lite"]
        dados_feedback = None

        print("[DEBUG] Iniciando chamadas para a API do Gemini...")
        for modelo in modelos:
            for tentativa in range(3):
                try:
                    response = client.models.generate_content(
                        model=modelo,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            response_mime_type="application/json",
                            response_schema=ChallengeFeedbackSchema,
                            temperature=0.2
                        )
                    )
                    if response.text:
                        dados_feedback = json.loads(response.text)
                        print(f"[DEBUG] Sucesso com o modelo {modelo} na tentativa {tentativa+1}. Nota atribuída: {dados_feedback.get('score_percentage')}")
                        break
                except ResourceExhausted:
                    print(f"[DEBUG] Aviso: Cota excedida no modelo {modelo}.")
                    break
                except APIError as e:
                    if "503" in str(e) or "UNAVAILABLE" in str(e):
                        print(f"[DEBUG] Aviso: Modelo {modelo} indisponível (503). Retentando...")
                        time.sleep(2)
                        continue
                    print(f"[DEBUG] Erro de API no modelo {modelo}: {str(e)}")
                    break
                except Exception as ex:
                    print(f"[DEBUG] Erro genérico na IA: {str(ex)}")
                    break
            if dados_feedback:
                break

        if not dados_feedback:
            print("[DEBUG] Aviso: Nenhum modelo respondeu com JSON válido. Usando feedback padrão de fallback.")
            dados_feedback = {
                "feedback_curto": "Boa tentativa! Revise os pontos principais da aula para otimizar seu código.",
                "prompt_pesquisa": f"Explique detalhadamente os conceitos práticos abordados em {lesson.title}",
                "score_percentage": 50.0 
            }

        feedback_formatado = f"💡 **Feedback:** {dados_feedback.get('feedback_curto')}\n\n💬 **Para aprofundar na IA:** `{dados_feedback.get('prompt_pesquisa')}`"
        nota_real = float(dados_feedback.get('score_percentage', 60.0))

        print(f"[DEBUG] Salvando submissão no banco de dados para o aluno {user.username}...")
        submission, created_sub = StudentChallengeSubmission.objects.update_or_create(
            student=user,
            challenge=challenge,
            defaults={
                'answer_text': answer_text,
                'improvements': feedback_formatado,
                'strengths': "", 
                'score_percentage': nota_real 
            }
        )
        print(f"[DEBUG] Submissão salva com sucesso! ID da submissão: {submission.id} (Criada agora? {created_sub})")

        aula_concluida = False
        if nota_real >= 70.0:
            print(f"[DEBUG] Nota ({nota_real}%) >= 70.0. Marcando aula como concluída...")
            from .lesson_service import LessonService
            LessonService.marcar_aula_como_concluida(user, lesson)
            aula_concluida = True
        else:
            print(f"[DEBUG] Nota ({nota_real}%) < 70.0. Aula não concluída. O aluno pode tentar novamente quando quiser.")

        print(f"[DEBUG] === FIM SUBMISSÃO DE DESAFIO ===\n")
        return {
            "message": "Desafio avaliado com sucesso!",
            "feedback": feedback_formatado,
            "score": submission.score_percentage,
            "lesson_completed": aula_concluida
        }, status.HTTP_200_OK

    @staticmethod
    def handle_save_instructor_challenge(lesson: Lesson, request_data: dict) -> LessonChallenge:
        print(f"\n[DEBUG] === SALVANDO DESAFIO PELO INSTRUTOR ===")
        print(f"[DEBUG] Aula ID: {lesson.id} - {lesson.title}")
        print(f"[DEBUG] Dados recebidos do front: {request_data}")
        
        challenge, created = LessonChallenge.objects.update_or_create(
            lesson=lesson,
            defaults={
                'title': request_data.get('title'),
                'description': request_data.get('description'),
                'taxonomy_level': request_data.get('taxonomy_level', 'analisar'),
                'evaluation_criteria': request_data.get('evaluation_criteria')
            }
        )
        print(f"[DEBUG] Desafio do instrutor salvo com sucesso! ID: {challenge.id} (Criado agora? {created})")
        print(f"[DEBUG] === FIM SALVAMENTO INSTRUTOR ===\n")
        return challenge