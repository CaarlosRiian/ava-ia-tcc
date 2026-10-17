import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/BreadCrumb";

export default function TermosUsoPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      <Header />
      
      <Breadcrumb items={[{ label: "Termos de Uso" }]} />

      <main className="flex-1 container max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-black text-[#161B1D] mb-6">Termos de Uso</h1>
        <div className="bg-white p-8 rounded-2xl shadow-sm space-y-4 text-gray-600 leading-relaxed border border-gray-100">
          <p>Bem-vindo aos Termos de Uso do <strong>AVA-IA</strong>. Ao aceder ou utilizar a nossa plataforma, concorda em cumprir estes termos.</p>
          
          <h2 className="text-xl font-bold text-gray-800 mt-6">1. Utilização da Plataforma</h2>
          <p>A nossa plataforma destina-se a apoiar o processo de ensino e aprendizagem através de inteligência artificial. O utilizador compromete-se a utilizá-la de forma ética, respeitando as leis vigentes.</p>
          
          <h2 className="text-xl font-bold text-gray-800 mt-6">2. Contas de Utilizador</h2>
          <p>É responsável por manter a confidencialidade das credenciais da sua conta e por todas as atividades realizadas sob a mesma.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}