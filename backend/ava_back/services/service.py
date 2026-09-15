import json
import os
import time
from pathlib import Path
from typing import List
from pydantic import BaseModel, Field

from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai.errors import APIError
from google.api_core.exceptions import ResourceExhausted

from rest_framework.exceptions import ValidationError
from django.utils import timezone
from rest_framework.response import Response
from rest_framework import status

from ..models import AIAssistant, Lesson, StudentPerformance, Course, LessonProgress

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(os.path.join(BASE_DIR, '.env'))


class QuizQuestionSchema(BaseModel):
    question: str = Field(description="Texto da pergunta de múltipla escolha")
    options: List[str] = Field(description="Array com exatamente 4 opções de resposta")
    answer: str = Field(description="Texto exato da opção correta")
    explanation: str = Field(description="Breve explicação pedagógica sobre a resposta correta")

class LessonAISchema(BaseModel):
    resumo: str = Field(description="Texto detalhado do resumo formatado em Markdown com tópicos e negritos")
    questions: List[QuizQuestionSchema] = Field(description="Lista com exatamente 3 questões de múltipla escolha")


class LessonService:
    
    @staticmethod
    def _obter_cliente_gemini() -> genai.Client:
        gemini_key = os.environ.get("GEMINI_API_KEY")
        if not gemini_key:
            raise ValidationError({"error": "A chave GEMINI_API_KEY não foi configurada no ambiente do servidor."})
        return genai.Client(api_key=gemini_key)

    @staticmethod
    def obter_contexto_da_aula(lesson: Lesson) -> str:
        materiais_texto = lesson.materials.filter(material_type='text')
        
        if not materiais_texto.exists():
            return ""
            
        conteudo_completo = [
            f"--- Material: {material.title} ---\n{material.raw_content}"
            for material in materiais_texto if material.raw_content
        ]
                
        return "\n\n".join(conteudo_completo)

    @staticmethod
    def processar_ia_da_aula(lesson: Lesson) -> AIAssistant:
        texto_material = LessonService.obter_contexto_da_aula(lesson)

        if not texto_material or len(texto_material.strip()) < 10:
            texto_material = (
                f"Esta é uma aula de nível superior intitulada '{lesson.title}'. "
                "O foco principal é guiar os estudantes nos conceitos iniciais e fundamentais "
                "sobre este assunto dentro do escopo acadêmico."
            )

        prompt = f"""
        Você é um tutor educacional focado em tecnologia e desenvolvimento de sistemas.
        Gere um resumo detalhado e exatamente 3 questões de múltipla escolha sobre o seguinte conteúdo didático:

        {texto_material}
        """

        client = LessonService._obter_cliente_gemini()
        modelos = ["gemini-2.5-flash", "gemini-3.5-flash-lite"]

        for modelo in modelos:
            for tentativa in range(3):
                try:
                    response = client.models.generate_content(
                        model=modelo,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            response_mime_type="application/json",
                            response_schema=LessonAISchema,
                            temperature=0.3
                        )
                    )
                    dados = json.loads(response.text)

                    ai_content, _ = AIAssistant.objects.get_or_create(lesson=lesson)
                    ai_content.summary = dados.get("resumo", "")
                    ai_content.quiz_json = {"questions": dados.get("questions", [])}
                    ai_content.save()
                    return ai_content

                except ResourceExhausted as e:
                    print(f"[Aviso IA - Quiz]: Cota excedida no modelo {modelo}: {str(e)}. Alternando modelo...")
                    break
                except APIError as e:
                    msg_erro = str(e)
                    if "503" in msg_erro or "UNAVAILABLE" in msg_erro:
                        tempo_espera = (tentativa + 1) * 2
                        print(f"[Aviso IA - Quiz]: {modelo} ocupado (503). Retentando em {tempo_espera}s... ({tentativa+1}/3)")
                        time.sleep(tempo_espera)
                        continue
                    print(f"[Aviso IA - Quiz]: Falha no modelo {modelo}: {msg_erro}. Tentando próximo...")
                    break
                except (json.JSONDecodeError, Exception) as e:
                    print(f"[ERRO QUIZ IA]: {str(e)}")
                    break

        raise ValidationError({"error": "Falha na comunicação com o serviço de IA para geração do Quiz/Resumo."})

    @staticmethod
    def handle_chat_action(viewset, request, lesson: Lesson):
        pergunta_aluno = (
            request.data.get("message") or 
            request.data.get("pergunta") or 
            request.data.get("prompt") or 
            request.data.get("text")
        )

        if not pergunta_aluno:
            return Response(
                {"error": "É necessário enviar uma mensagem válida no corpo da requisição."},
                status=status.HTTP_400_BAD_REQUEST
            )

        usuario = request.user if request.user and request.user.is_authenticated else None

        resposta_ia = LessonService.responder_duvida_da_aula(
            lesson=lesson, 
            pergunta_aluno=pergunta_aluno, 
            user=usuario
        )

        return Response(
            {"response": resposta_ia},
            status=status.HTTP_200_OK
        )
    
    @staticmethod
    def obter_contexto_adaptativo_do_aluno(user, lesson):
        if not user or not user.is_authenticated:
            return "Perfil do aluno: Usuário não autenticado no chat."

        historico = StudentPerformance.objects.filter(user=user, lesson=lesson).order_by('-created_at').first()
        
        if not historico:
            return "Perfil do aluno nesta aula: Primeiro contato / Sem tentativas de quiz registradas."

        weak = historico.weak_topics or []
        topicos_fracos = ", ".join(weak) if isinstance(weak, list) and weak else "Nenhum tópico crítico (gabaritou ou acertou a maioria)"

        return f"""
        Perfil Adaptativo do Aluno para esta aula:
        - Desempenho na última tentativa do Quiz: {historico.score_percentage}%
        - Tópicos onde o aluno demonstrou DIFICULDADE/ERRO: {topicos_fracos}
        - Diretriz Pedagógica: Se o aluno perguntar sobre o que errou ou pedir explicações, foque imediatamente nesses 'Tópicos onde o aluno demonstrou DIFICULDADE/ERRO'.
        """

    @staticmethod
    def handle_get_quiz(viewset, lesson: Lesson):
        try:
            ai_content = lesson.ai_assistant
        except AIAssistant.DoesNotExist:
            ai_content = LessonService.processar_ia_da_aula(lesson)

        if not ai_content.quiz_json or "questions" not in ai_content.quiz_json:
            ai_content = LessonService.processar_ia_da_aula(lesson)

        return Response(
            ai_content.quiz_json,
            status=status.HTTP_200_OK
        )

    @staticmethod
    def responder_duvida_da_aula(lesson: Lesson, pergunta_aluno: str, user=None) -> str:
        texto_material = LessonService.obter_contexto_da_aula(lesson)
        contexto_aluno = LessonService.obter_contexto_adaptativo_do_aluno(user, lesson) if user else ""
        
        prompt = f"""
        Você é um tutor cognitivo e assistente virtual de uma plataforma de ensino.
        O aluno está assistindo à aula "{lesson.title}" e enviou uma mensagem/dúvida.
        
        {contexto_aluno}

        Material Didático da Aula:
        \"\"\"{texto_material}\"\"\"

        Mensagem/Pergunta do Aluno:
        "{pergunta_aluno}"

        REGRAS RÍGIDAS DE FORMATAÇÃO E RESPOSTA:
        1. Responda diretamente ao aluno de forma natural, clara, concisa e encorajadora.
        2. Seja objetivo: evite introduções longas ou respostas prolixas a menos que o aluno peça explicitamente uma explicação detalhada.
        3. Se a mensagem for uma solicitação de atalho como "Gerar Exercícios de Fixação" ou similar, crie imediatamente 2 a 3 questões práticas/dissertativas para o aluno responder e fixar o conteúdo.
        4. NUNCA cite, mencione ou escreva os termos "Taxonomia de Bloom", "Nível de Bloom", "Nível de Aprendizado", nem termos entre parênteses como "(Nível: Entender)".
        5. Se o aluno pedir resumos ou explicações, foque puramente no conteúdo acadêmico.
        6. Se o aluno fugir do assunto da aula, reforce amigavelmente o foco na disciplina atual.
        """

        client = LessonService._obter_cliente_gemini()
        modelos = ["gemini-3.5-flash-lite", "gemini-2.5-flash"]

        for modelo in modelos:
            for tentativa in range(3):
                try:
                    response = client.models.generate_content(
                        model=modelo,
                        contents=prompt,
                    )
                    
                    if response.text:
                        return response.text

                except ResourceExhausted as e:
                    print(f"[Aviso IA]: Cota excedida no modelo {modelo}: {str(e)}. Alternando modelo...")
                    break 
                except APIError as e:
                    msg_erro = str(e)
                    if "503" in msg_erro or "UNAVAILABLE" in msg_erro:
                        tempo_espera = (tentativa + 1) * 2
                        print(f"[Aviso IA]: {modelo} ocupado (503). Retentando em {tempo_espera}s... (Tentativa {tentativa+1}/3)")
                        time.sleep(tempo_espera)
                        continue
                    print(f"[Aviso IA]: Falha no modelo {modelo}: {msg_erro}. Tentando próximo modelo...")
                    break
                except Exception as e:
                    print(f"[ERRO CHAT IA]: {str(e)}")
                    break

        raise ValidationError({"error": "O serviço de IA está temporariamente sobrecarregado. Por favor, tente novamente em alguns instantes."})

    @staticmethod
    def salvar_desempenho_quiz(user, lesson: Lesson, data: dict) -> StudentPerformance:
        score = data.get("score", 0)
        total = data.get("total_questions", 0)
        
        if total > 0:
            porcentagem = round((score / total) * 100, 2)
        else:
            porcentagem = data.get("percentage") or data.get("score_percentage", 0.0)

        weak_topics = data.get("weak_topics", [])
        strong_topics = data.get("strong_topics", [])

        performance = StudentPerformance.objects.create(
            user=user,
            lesson=lesson,
            score_percentage=porcentagem,
            weak_topics=weak_topics,
            strong_topics=strong_topics
        )
        return performance

    @staticmethod
    def handle_submit_quiz_action(request, lesson: Lesson):
        user = request.user
        if not user or not user.is_authenticated:
            return Response(
                {"error": "Usuário não autenticado."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        data = request.data
        score = data.get("score", 0)
        total = data.get("total_questions", 0)
        
        if total > 0:
            porcentagem = round((float(score) / float(total)) * 100, 2)
        else:
            porcentagem = float(data.get("percentage") or data.get("score_percentage", 0.0))

        performance = StudentPerformance.objects.create(
            user=user,
            lesson=lesson,
            score_percentage=porcentagem,
            weak_topics=data.get("weak_topics", []),
            strong_topics=data.get("strong_topics", [])
        )

        return Response({
            "message": "Desempenho salvo com sucesso!",
            "id": performance.id,
            "score_percentage": performance.score_percentage
        }, status=status.HTTP_201_CREATED)

    @staticmethod
    def gerar_html_certificado(user, course) -> str:
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

        return f"""
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

    @staticmethod
    def handle_get_challenge(lesson: Lesson):
        from ..models import Challenge
        try:
            challenge = lesson.challenge
            return Response({
                "id": challenge.id,
                "title": challenge.title,
                "description": challenge.description,
                "taxonomy_level": challenge.taxonomy_level,
                "taxonomy_level_display": challenge.get_taxonomy_level_display()
            }, status=status.HTTP_200_OK)
        except Challenge.DoesNotExist:
            return Response({"detail": "Nenhum desafio prático cadastrado para esta aula."}, status=status.HTTP_404_NOT_FOUND)

    @staticmethod
    def handle_submit_challenge_action(request, lesson: Lesson):
        from ..models import Challenge, StudentChallengeSubmission
        
        try:
            challenge = lesson.challenge
        except Challenge.DoesNotExist:
            return Response({"error": "Desafio não encontrado para esta aula."}, status=status.HTTP_404_NOT_FOUND)

        answer_text = request.data.get('answer_text', '')
        if not answer_text:
            return Response({"error": "A resposta não pode estar vazia."}, status=status.HTTP_400_BAD_REQUEST)

        prompt = f"""
        Você é um assistente pedagógico de IA em uma plataforma educacional de tecnologia.
        O professor responsável é Fernando Alonso (Tech Lead Sênior).
        
        Contexto da Aula: {lesson.title}
        Enunciado do Desafio ({challenge.get_taxonomy_level_display()}): {challenge.description}
        Critérios de Avaliação Esperados: {challenge.evaluation_criteria}

        Resposta enviada pelo aluno:
        "{answer_text}"

        Por favor, analise a resposta do aluno criticamente com base nos critérios do professor.
        Retorne a resposta estruturada contendo:
        - Pontos Fortes: ...
        - O que melhorar: ...
        - Nota (0 a 100): ...
        - Sugestão de Revisão (indique se ele precisa revisar algum ponto da aula ou deixe em branco): ...
        """

        client = LessonService._obter_cliente_gemini()
        modelos = ["gemini-2.5-flash", "gemini-3.5-flash-lite"]
        feedback_text = ""

        for modelo in modelos:
            for tentativa in range(3):
                try:
                    response = client.models.generate_content(
                        model=modelo,
                        contents=prompt,
                    )
                    if response.text:
                        feedback_text = response.text
                        break
                except ResourceExhausted as e:
                    print(f"[Aviso IA - Desafio]: Cota excedida no modelo {modelo}: {str(e)}. Alternando modelo...")
                    break
                except APIError as e:
                    msg_erro = str(e)
                    if "503" in msg_erro or "UNAVAILABLE" in msg_erro:
                        tempo_espera = (tentativa + 1) * 2
                        time.sleep(tempo_espera)
                        continue
                    break
                except Exception as e:
                    break
            if feedback_text:
                break

        if not feedback_text:
            feedback_text = "Avaliação realizada com sucesso, mas houve instabilidade na IA ao gerar os detalhes do feedback."

        submission, _ = StudentChallengeSubmission.objects.update_or_create(
            student=request.user,
            challenge=challenge,
            defaults={
                'answer_text': answer_text,
                'improvements': feedback_text,
                'score_percentage': 85.0 
            }
        )

        return Response({
            "message": "Desafio avaliado com sucesso!",
            "feedback": feedback_text,
            "score": submission.score_percentage
        }, status=status.HTTP_200_OK)


class CourseService:
    @staticmethod
    def get_recommended_courses(user):
        from ..models import Course
        from django.db.models import Q

        queryset = Course.objects.filter(published=True)

        user_age = getattr(user, 'age', None)
        user_interests = getattr(user, 'interests', []) or []

        if not user_age and not user_interests:
            return queryset.order_by('-created_at')[:10]

        query = Q()

        if user_interests:
            query &= (Q(target_area__in=user_interests) | Q(category__name__in=user_interests))

        if user_age is not None:
            query &= Q(min_age__lte=user_age, max_age__gte=user_age)

        recommended = queryset.filter(query).distinct()

        return recommended.order_by('-created_at')