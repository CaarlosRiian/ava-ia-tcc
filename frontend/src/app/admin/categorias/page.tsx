"use client";

import Header from "@/components/Header";
import Breadcrumb from "@/components/BreadCrumb"; 
import { useCategories } from "./feature/useCategories";
import { CategoryForm } from "./_components/CategoryForm";
import { CategoryList } from "./_components/CategoryList";

export default function AdminCategorias() {
  const {categorias, loading, nome, setNome, imagemPreview, nomeArquivo, inputRef, handleArquivo, limparFormulario, handleSalvar, handleRemover, handleEditar, 
  } = useCategories();

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header />

      <Breadcrumb 
        items={[
          { label: "Painel do Administrador" },
          { label: "Gerenciar Categorias" }
        ]} 
      />

      <main className="max-w-5xl mx-auto pt-6 pb-12 px-4 space-y-6">
        <header>
          <h1 className="text-2xl font-black text-[#161B1D]">Gerenciar Categorias</h1>
          <p className="text-gray-500 text-sm mt-1">
            Cadastre e controle as categorias estruturais de cursos da plataforma.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-[1fr,1.3fr] items-start">
          <CategoryForm
            nome={nome}
            setNome={setNome}
            imagemPreview={imagemPreview}
            nomeArquivo={nomeArquivo}
            inputRef={inputRef}
            handleArquivo={handleArquivo}
            limparFormulario={limparFormulario}
            handleSalvar={handleSalvar}
          />

          <CategoryList 
            categorias={categorias} 
            loading={loading} 
            handleRemover={handleRemover} 
            handleEditar={handleEditar} 
          />
        </div>
      </main>
    </div>
  );
}