import os
import json
from dotenv import load_dotenv
from ava_back.models import Lesson, AIAssistant

load_dotenv()

USE_AI_MOCK = os.getenv("USE_AI_MOCK", "False") == "True"

def mock_response(lesson):
    return {
        "summary": f"Resumo mock da aula '{lesson.title}'",
        "quiz": [
            {
                "question": f"Qual é o tema da aula '{lesson.title}'?",
                "options": ["A", "B", "C", "D"],
                "answer": "A",
                "explanation": "Resposta mock apenas para testes."
            }
        ]
    }

def build_prompt(lesson):
    return f"""
    Você é um tutor educacional.

    Gere um resumo e um quiz com base na aula abaixo.

    Responda APENAS em JSON válido.

    Aula:
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
            model="gpt-4.1-mini",
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
            data = json.loads(content)
        except json.JSONDecodeError:
            print("Erro JSON:", content)
            return None

    AIAssistant.objects.update_or_create(
        lesson=lesson,
        defaults={
            "summary": data.get("summary"),
            "quiz_json": data.get("quiz")
        }
    )

    return data