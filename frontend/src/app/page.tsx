import Link from "next/link";
import { BookOpen, Sparkles, Brain, MessageCircle, ArrowRight, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2F52E0] opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-[#161B1D]">
              Aprenda melhor com{" "}
              <span className="text-[#2F52E0]">IA ao seu lado</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-500 mb-8 max-w-2xl mx-auto font-light">
              O AVA-IA é uma plataforma onde a inteligência artificial te acompanha,
              gera resumos, exercícios e corrige suas atividades em tempo real.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cadastro" className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#2F52E0] text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                Começar Agora <ArrowRight className="h-5 w-5" />
              </Link>
              
              <Link href="/entrar" className="inline-flex items-center justify-center px-8 py-3 border border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-all">
                Já possuo uma conta
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#161B1D]">
              Como a IA te ajuda a aprender
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto font-light">
              Ferramentas inteligentes que se adaptam ao seu ritmo de estudo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Resumos Inteligentes",
                desc: "A IA gera resumos completos, destacando os pontos mais importantes das aulas.",
              },
              {
                icon: Brain,
                title: "Exercícios Reais",
                desc: "Receba exercícios personalizados baseados no que você acabou de estudar.",
              },
              {
                icon: MessageCircle,
                title: "Tire Dúvidas",
                desc: "Não entendeu algo? Pergunte à IA e receba explicações claras e didáticas.",
              },
              {
                icon: CheckCircle,
                title: "Correção Instantânea",
                desc: "Envie suas respostas e a IA corrige, dá feedback e sugere melhorias na hora.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-gray-100 bg-white p-6 hover:shadow-xl transition-all"
              >
                <div className="bg-blue-50 text-[#2F52E0] rounded-lg p-2.5 w-fit mb-4">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-[#161B1D]">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-gray-100 bg-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-[#2F52E0] rounded-lg p-1.5 text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <span>AVA-<span className="text-[#2F52E0]">IA</span></span>
          </div>
          <p className="text-sm text-gray-400 font-light">
            © 2026 AVA-IA. Ambiente Virtual de Aprendizagem com IA.
          </p>
        </div>
      </footer>
    </div>
  );
}