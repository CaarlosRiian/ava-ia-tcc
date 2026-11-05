from django.utils import timezone
from h11 import Response
from rest_framework.exceptions import ValidationError
from ..models import Lesson, LessonProgress
import os
from google import genai
from rest_framework.response import Response
from rest_framework import status

class LessonService:
    
    @staticmethod
    def marcar_aula_como_concluida(user, lesson):
        progress, created = LessonProgress.objects.get_or_create(
            user=user,
            lesson=lesson,
            defaults={'completed': True}
        )
        if not progress.completed:
            progress.completed = True
            progress.save()
            
        return (
            {"message": "Aula marcada como concluída com sucesso!", "completed": True},
            200
        )

    @staticmethod
    def handle_submit_challenge_action(user, lesson, answer_text):
        from ..models import LessonChallenge, StudentChallengeSubmission
        import os
        from google import genai

        challenge = LessonChallenge.objects.filter(lesson=lesson).first()
        if not challenge:
            return {"detail": "Nenhum desafio encontrado para esta aula."}, 404

        score = 85.0  
        feedback = "Parabéns pela resolução! 💬 Dica: Experimente aprofundar os estudos explorando mais detalhes da documentação oficial."

        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if api_key:
            try:
                client = genai.Client(api_key=api_key)
                prompt = f"""
                Você é um professor avaliador rigoroso, porém construtivo.
                Desafio: {challenge.title}
                Descrição: {challenge.description}
                Critérios de Avaliação: {challenge.evaluation_criteria}
                
                Resposta do Aluno: {answer_text}
                
                Com base nos critérios de avaliação, atribua uma nota de 0 a 100 e forneça um feedback construtivo.
                Retorne a sua avaliação estritamente no seguinte formato:
                NOTA: [número de 0 a 100]
                FEEDBACK: [Seu feedback detalhado aqui, e se houver algo para o aluno aprofundar, coloque após o símbolo 💬 um texto incentivando a conversar com o tutor de IA no chat]
                """
                
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                )
                text_res = response.text
                
                if "NOTA:" in text_res and "FEEDBACK:" in text_res:
                    parts = text_res.split("FEEDBACK:")
                    score_str = parts[0].replace("NOTA:", "").strip()
                    score = float(''.join(c for c in score_str if c.isdigit() or c == '.'))
                    feedback = parts[1].strip()
                else:
                    feedback = text_res
            except Exception as e:
                print(f"Erro na IA ao avaliar desafio: {e}")

        submission, created = StudentChallengeSubmission.objects.update_or_create(
            student=user,
            challenge=challenge,
            defaults={
                'answer_text': answer_text,
                'score_percentage': score,
                'improvements': feedback
            }
        )

        return {
            "submitted": True,
            "score": score,
            "feedback": feedback,
            "answer_text": answer_text,
            "passed": score >= 70.0
        }, 200

    @staticmethod
    def handle_chat_action(viewset_self, request, lesson):
        user_message = request.data.get('message') or request.data.get('prompt')
        if not user_message:
            return Response({"error": "A mensagem é obrigatória."}, status=status.HTTP_400_BAD_REQUEST)

        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            return Response({"error": "Chave da API do Gemini não configurada."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            client = genai.Client(api_key=api_key)
            
            materiais = lesson.materials.all()
            conteudo_materiais = "\n".join([
                f"- [{m.title}] ({m.material_type}): {m.raw_content or 'Arquivo anexo'}" 
                for m in materiais
            ]) or "Nenhum material de texto adicional cadastrado."

            context_prompt = f"""
            Você é um tutor de inteligência artificial estrito, focado e especializado exclusivamente no conteúdo da aula atual.
            A aula em que o aluno está no momento chama-se: '{lesson.title}'.
            
            MATERIAIS DE APOIO CADASTRADOS PARA ESTA AULA:
            {conteudo_materiais}
            
            REGRAS DE SEGURANÇA E ESCOPO OBRIGATÓRIAS:
            1. Você DEVE responder exclusivamente com base no tema, escopo e nos materiais de apoio da aula '{lesson.title}'.
            2. NENHUMA hipótese ou circunstância você deve aceitar pedidos de códigos em Python, resoluções de tarefas externas, piadas, conversas fiadas ou assuntos fora do tema da aula.
            3. Se o aluno pedir código em Python ou tentar desviar o assunto para fora da aula, recuse educadamente de forma firme e traga o foco de volta para o conteúdo da aula '{lesson.title}'.
            4. Responda de forma clara, didática e estritamente atrelada aos objetivos de aprendizado desta aula e aos materiais fornecidos.
            
            Mensagem do aluno: {user_message}
            """

            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=context_prompt,
            )
            
            reply_text = response.text
            return Response({"response": reply_text}, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Erro no chat com IA: {e}")
            return Response({"error": "Erro ao processar a resposta da IA."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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