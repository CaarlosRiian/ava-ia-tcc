import os
import json
from dotenv import load_dotenv
from rest_framework.response import Response
from rest_framework import status
from ava_back.models import Lesson, AIAssistant

load_dotenv()

USE_AI_MOCK = os.getenv("USE_AI_MOCK", "False") == "True"

def mock_response(lesson):
    return {
        "summary": f"Resumo didático da aula '{lesson.title}'.",
        "quiz": [
            {
                "bloom_level": "Lembrar",
                "question": f"Qual o conceito principal abordado na aula '{lesson.title}'?",
                "options": ["Conceito A", "Conceito B", "Conceito C", "Conceito D"],
                "answer": "Conceito A",
                "explanation": "Explicação teórica direta sobre o conceito."
            },
            {
                "bloom_level": "Aplicar",
                "question": "Como você aplicaria o conceito dessa aula em um problema real?",
                "options": ["Cenário 1", "Cenário 2", "Cenário 3", "Cenário 4"],
                "answer": "Cenário 1",
                "explanation": "Demonstração prática da aplicação do conceito."
            }
        ]
    }

def build_prompt(lesson):
    return f"""
        Você é um Tutor Educacional especializado em Aprendizagem Ativa e na Taxonomia de Bloom.
        Analise a aula fornecida e gere um resumo estruturado e um quiz adaptativo.

        Regras de Resposta:
        1. Responda ÚNICA e EXCLUSIVAMENTE com um JSON válido.
        2. Não utilize marcações markdown como ```json ... ```.
        3. Para cada questão do quiz, identifique o nível da Taxonomia de Bloom (Lembrar, Entender, Aplicar, Analisar).

        Estrutura JSON Obrigatória:
        {{
            "summary": "Resumo estruturado em Markdown com tópicos e explicações didáticas.",
            "quiz": [
                {{
                    "bloom_level": "Nível da Taxonomia de Bloom (Lembrar, Entender, Aplicar ou Analisar)",
                    "question": "Pergunta de fixação?",
                    "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
                    "answer": "Texto idêntico à opção correta",
                    "explanation": "Explicação pedagógica da resposta."
                }}
            ]
        }}

        Gere exatamente 3 questões evoluindo nos níveis de Bloom.

        Dados da Aula:
        Título: {lesson.title}
        Descrição: {getattr(lesson, 'description', 'Sem descrição fornecida.')}
    """

def generate_ai_for_lesson(lesson_id):
    try:
        lesson = Lesson.objects.get(id=lesson_id)
    except Lesson.DoesNotExist:
        return None

    if USE_AI_MOCK:
        data = mock_response(lesson)
    else:
        from openai import OpenAI

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise Exception("OPENAI_API_KEY não encontrada nas variáveis de ambiente.")

        client = OpenAI(api_key=api_key)
        prompt = build_prompt(lesson)

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": "Você é uma API pedagógica que retorna estritamente JSON válido."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )

        content = response.choices[0].message.content
        try:
            data = json.loads(content)
        except (json.JSONDecodeError, ValueError):
            return None

    ai_content, _ = AIAssistant.objects.update_or_create(
        lesson=lesson,
        defaults={
            "summary": data.get("summary"),
            "quiz_json": data.get("quiz")
        }
    )

    return ai_content

class LessonAIService:

    @staticmethod
    def handle_chat_action(viewset_instance, request, lesson):
        action_type = request.data.get("action_type")  
        pergunta = request.data.get("message")

        if action_type in ['summary', 'quiz']:
            try:
                ai_content = generate_ai_for_lesson(lesson.id)
                if not ai_content:
                    return Response({"error": "Falha ao processar requisição da IA."}, status=status.HTTP_502_BAD_GATEWAY)

                if action_type == 'summary':
                    return Response({"response": ai_content.summary}, status=status.HTTP_200_OK)
                    
                elif action_type == 'quiz':
                    questoes = ai_content.quiz_json if isinstance(ai_content.quiz_json, list) else []
                    formatted_quiz = "### Exercícios Adaptativos (Taxonomia de Bloom)\n\n"
                    for idx, q in enumerate(questoes, 1):
                        bloom = q.get('bloom_level', 'Geral')
                        formatted_quiz += f"**Q{idx} [{bloom}]: {q.get('question')}**\n"
                        for opt_idx, opt_val in enumerate(q.get('options', [])):
                            letra = ['A', 'B', 'C', 'D'][opt_idx] if opt_idx < 4 else str(opt_idx)
                            formatted_quiz += f"- **{letra})** {opt_val}\n"
                        formatted_quiz += "\n---\n"
                    
                    return Response({"response": formatted_quiz}, status=status.HTTP_200_OK)
                    
            except Exception as e:
                return Response({"error": f"Erro no serviço de IA: {str(e)}"}, status=status.HTTP_502_BAD_GATEWAY)

        if not pergunta:
            return Response({"error": "A mensagem não pode estar vazia."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from openai import OpenAI
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            
            ai_assistant = AIAssistant.objects.filter(lesson=lesson).first()
            contexto = ai_assistant.summary if ai_assistant else "Conteúdo geral de tecnologia."

            socratic_system_prompt = (
                "Você é um Tutor Socrático de Aprendizagem Ativa. "
                "Nunca forneça a resposta direta do problema ou código pronto. "
                "Responda à dúvida do aluno fazendo uma pergunta orientadora ou dando uma dica "
                "para estimulá-lo a analisar e chegar à conclusão sozinho. "
                f"Contexto da Aula: {contexto[:500]}"
            )

            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": socratic_system_prompt},
                    {"role": "user", "content": pergunta}
                ],
                temperature=0.4
            )

            tutor_reply = completion.choices[0].message.content
            return Response({"response": tutor_reply}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Falha na consulta socrática: {str(e)}"}, status=status.HTTP_502_BAD_GATEWAY)

    @staticmethod
    def handle_get_quiz(viewset_instance, lesson):
        try:
            ai_content = AIAssistant.objects.get(lesson=lesson)
            questoes = ai_content.quiz_json if isinstance(ai_content.quiz_json, list) else []
            if not questoes:
                return Response({"error": "Nenhum exercício encontrado."}, status=status.HTTP_404_NOT_FOUND)
            return Response({"questions": questoes}, status=status.HTTP_200_OK)
        except AIAssistant.DoesNotExist:
            return Response({"error": "Exercícios não processados pela IA."}, status=status.HTTP_404_NOT_FOUND)