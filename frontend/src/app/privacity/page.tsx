import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/BreadCrumb";

export default function PrivacidadePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      <Header />
      
      <Breadcrumb items={[{ label: "Política de Privacidade" }]} />

      <main className="flex-1 container max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-black text-[#161B1D] mb-6">Política de Privacidade</h1>
        <div className="bg-white p-8 rounded-2xl shadow-sm space-y-4 text-gray-600 leading-relaxed border border-gray-100">
          <p>A sua privacidade é fundamental para o <strong>AVA-IA</strong>. Esta política explica como recolhemos, usamos e protegemos as suas informações pessoais.</p>
          
          <h2 className="text-xl font-bold text-gray-800 mt-6">1. Informações Recolhidas</h2>
          <p>recolhemos dados fornecidos por si durante o registo (como nome e email) e dados de interação com o ambiente virtual de aprendizagem.</p>
          
          <h2 className="text-xl font-bold text-gray-800 mt-6">2. Proteção de Dados</h2>
          <p>Implementamos medidas de segurança técnicas e administrativas robustas para garantir que os seus dados estão seguros contra acessos não autorizados.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}