import os
import json
from dotenv import load_dotenv
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from ava_back.models import Lesson, AIAssistant

load_dotenv()

USE_AI_MOCK = os.getenv("USE_AI_MOCK", "False") == "True"

def mock_response(lesson):
    return {
        "summary": f"Resumo mock da aula '{lesson.title}'",
        "quiz": [
            {
                "question": f"Qual é o tema da aula '{lesson.title}'?",
                "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
                "answer": "Opção A",
                "explanation": "Resposta mock apenas para testes."
            }
        ]
    }

def build_prompt(lesson):
    return f"""
        Você é um tutor educacional focado em tecnologia e desenvolvimento de sistemas. 
        Gere um resumo e um quiz com base nos dados da aula fornecidos abaixo.

        Regras estritas de resposta:
        1. Responda ÚNICA e EXCLUSIVAMENTE com um objeto JSON válido.
        2. Não utilize blocos de código markdown (proibido usar ```json ... ```).
        3. Siga exatamente a estrutura do schema JSON abaixo:

        {{
        "summary": "Texto do resumo da aula formatado estruturadamente em Markdown, utilizando tópicos, negritos e parágrafos didáticos.",
        "quiz": [
            {{
            "question": "Texto da pergunta de múltipla escolha?",
            "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
            "answer": "Texto exato da opção correta (deve ser idêntico a uma das strings contidas no array 'options')",
            "explanation": "Uma breve explicação do porquê essa resposta está correta."
            }}
        ]
        }}

        Gere exatamente 3 questões de fixação no array do quiz.

        Dados da Aula:
        Título: {lesson.title}
        Descrição: {lesson.description}
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
            raise Exception("OPENAI_API_KEY não encontrada")

        client = OpenAI(api_key=api_key)
        prompt = build_prompt(lesson)

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Responda SOMENTE em JSON válido."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2
        )

        content = response.choices[0].message.content
        content = content.replace("```json", "").replace("```", "").strip()
        
        try:
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            if start_idx != -1 and end_idx != 0:
                content = content[start_idx:end_idx]
            
            data = json.loads(content)
        except (json.JSONDecodeError, ValueError) as e:
            print("Erro crítico ao decodificar JSON da IA:", content)
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
                    return Response({"error": "Falha ao gerar conteúdo de IA"}, status=status.HTTP_502_BAD_GATEWAY)

                if action_type == 'summary':
                    return Response({
                        "response": ai_content.summary
                    }, status=status.HTTP_200_OK)
                    
                elif action_type == 'quiz':
                    questoes = ai_content.quiz_json if isinstance(ai_content.quiz_json, list) else []
                    
                    formatted_quiz = "### Exercícios de Fixação Gerados!\n\n"
                    for idx, q in enumerate(questoes, 1):
                        formatted_quiz += f"**Q{idx}: {q.get('question')}**\n"
                        options = q.get('options', [])
                        letras = ['A', 'B', 'C', 'D']
                        for opt_idx, opt_val in enumerate(options):
                            letra = letras[opt_idx] if opt_idx < len(letras) else str(opt_idx)
                            formatted_quiz += f"- **{letra})** {opt_val}\n"
                        formatted_quiz += "\n---\n"
                    
                    return Response({
                        "response": formatted_quiz
                    }, status=status.HTTP_200_OK)
                    
            except Exception as e:
                return Response({"error": f"Erro na IA: {str(e)}"}, status=status.HTTP_502_BAD_GATEWAY)

        if not pergunta:
            return Response({"error": "A mensagem não pode estar vazia."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ai_assistant = AIAssistant.objects.filter(lesson=lesson).first()
            contexto = ai_assistant.summary if ai_assistant else "Sem contexto gerado."
            return Response({
                "response": f"Processando sua dúvida baseada na aula... (Contexto atual guardado: {contexto[:60]}...)"
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_502_BAD_GATEWAY)

    @staticmethod
    def handle_get_quiz(viewset_instance, lesson):
        """Nova rota criada para o Caminho 2 (Buscar JSON bruto no front-end)"""
        try:
            ai_content = AIAssistant.objects.get(lesson=lesson)
            questoes = ai_content.quiz_json if isinstance(ai_content.quiz_json, list) else []
            
            if not questoes:
                return Response({"error": "Nenhum exercício gerado para esta aula."}, status=status.HTTP_404_NOT_FOUND)
                
            return Response({"questions": questoes}, status=status.HTTP_200_OK)
        except AIAssistant.DoesNotExist:
            return Response({"error": "Exercícios não processados pela IA."}, status=status.HTTP_404_NOT_FOUND)