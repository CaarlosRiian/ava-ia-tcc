"use client";

import { ArrowLeft, Upload, Sparkles, HelpCircle } from "lucide-react";

type AddMaterialFormProps = {
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  handleClose: () => void;
  selectedModuleId: string;
  setSelectedModuleId: (id: string) => void;
  setSelectedLessonId: (id: string) => void;
  selectedLessonId: string;
  modulosDoCurso: any[];
  aulasDoModuloSelecionado: any[];
  materialTitle: string;
  setMaterialTitle: (title: string) => void;
  materialType: string;
  setMaterialType: (type: string) => void;
  setRawContent: (content: string) => void;
  setPdfFile: (file: File | null) => void;
  rawContent: string;
  pdfFile: File | null;
  loading: boolean;
  onShowToast: (message: string, type?: "success" | "error") => void;
};

export function AddMaterialForm({
  onBack,
  onSubmit,
  handleClose,
  selectedModuleId,
  setSelectedModuleId,
  setSelectedLessonId,
  selectedLessonId,
  modulosDoCurso,
  aulasDoModuloSelecionado,
  materialTitle,
  setMaterialTitle,
  materialType,
  setMaterialType,
  setRawContent,
  setPdfFile,
  rawContent,
  pdfFile,
  loading,
}: AddMaterialFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3.5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 transition cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-base font-bold text-gray-900">Adicionar Conteúdo de Apoio</h2>
          <p className="text-[11px] text-gray-400">Insira materiais de referência para a IA mapear.</p>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Módulo Alvo</label>
        <select
          required
          value={selectedModuleId}
          onChange={(e) => {
            setSelectedModuleId(e.target.value);
            setSelectedLessonId("");
          }}
          className="w-full rounded-lg border border-gray-200 px-3 h-9 text-xs focus:border-[#FF7A00] outline-none cursor-pointer"
        >
          <option value="">Selecione o Módulo</option>
          {modulosDoCurso.map((m: any) => (
            <option key={m.id} value={m.id}>{m.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Aula Vinculada</label>
        <select
          required
          value={selectedLessonId}
          disabled={!selectedModuleId}
          onChange={(e) => setSelectedLessonId(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 h-9 text-xs focus:border-[#FF7A00] outline-none disabled:bg-gray-50 disabled:text-gray-400 cursor-pointer"
        >
          <option value="">Selecione a Aula</option>
          {aulasDoModuloSelecionado.map((a: any) => (
            <option key={a.id} value={a.id}>{a.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Identificação do Material</label>
        <input
          type="text"
          required
          value={materialTitle}
          onChange={(e) => setMaterialTitle(e.target.value)}
          placeholder="Ex: Notas de Aula - Arquitetura de Software"
          className="w-full rounded-lg border border-gray-200 px-3 h-9 text-xs focus:border-[#FF7A00] outline-none"
        />
      </div>

      <div>
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Formato do Recurso</label>
        <select
          value={materialType}
          onChange={(e) => {
            setMaterialType(e.target.value);
            setRawContent("");
            setPdfFile(null);
          }}
          className="w-full rounded-lg border border-gray-200 px-3 h-9 text-xs focus:border-[#FF7A00] outline-none cursor-pointer"
        >
          <option value="text">Texto Escrito / Contexto para a IA</option>
          <option value="pdf">Documento PDF (Upload)</option>
          <option value="link">Link de Referência Externo</option>
        </select>
      </div>

      {materialType === "text" && (
        <div className="animate-in fade-in duration-200 space-y-1.5">
          {/* Caixa explicativa elegante para o professor entender a função do texto */}
          <div className="rounded-xl border border-orange-100 bg-orange-50/70 p-3 flex items-start gap-2.5">
            <div className="p-1 rounded-lg bg-orange-100 text-[#FF7A00] shrink-0 mt-0.5">
              <Sparkles size={14} />
            </div>
            <div className="text-[11px] text-amber-900 leading-relaxed">
              <span className="font-bold block text-orange-900 mb-0.5">Alimentar o Tutor de IA</span>
              Este texto <strong className="font-semibold">não será exibido diretamente como leitura para o aluno</strong>. Ele serve como base de conhecimento exclusiva para o tutor virtual responder com precisão cirúrgica às dúvidas da turma. Quanto mais rico em detalhes, melhor a IA orientará os estudantes!
            </div>
          </div>

          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 pt-1">Corpo do Texto Técnico</label>
          <textarea
            required
            rows={5}
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            placeholder="Cole aqui conceitos, regras de negócio ou explicações aprofundadas que o tutor virtual deve memorizar..."
            className="w-full rounded-lg border border-gray-200 p-2.5 text-xs focus:border-[#FF7A00] outline-none resize-none font-sans leading-relaxed"
          />
        </div>
      )}

      {materialType === "link" && (
        <div className="animate-in fade-in duration-200">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">URL de Referência</label>
          <input
            type="url"
            required
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            placeholder="https://exemplo.com/artigo-tecnico"
            className="w-full rounded-lg border border-gray-200 px-3 h-9 text-xs focus:border-[#FF7A00] outline-none"
          />
        </div>
      )}

      {materialType === "pdf" && (
        <div className="animate-in fade-in duration-200">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Upload do Arquivo PDF</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer bg-gray-50/50 hover:bg-gray-50 transition p-4">
              <div className="flex flex-col items-center justify-center text-center">
                <Upload size={20} className="text-gray-400 mb-2" />
                <p className="text-xs text-gray-600 font-semibold">
                  {pdfFile ? pdfFile.name : "Clique para selecionar o PDF"}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">Apenas arquivos .pdf</p>
              </div>
              <input
                type="file"
                accept=".pdf"
                required={!pdfFile}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setPdfFile(file);
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={handleClose}
          className="px-3 h-8 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-[#FF7A00] hover:bg-[#ea7306] px-4 h-8 rounded-lg text-xs font-semibold text-white disabled:bg-gray-400 cursor-pointer shadow-sm transition"
        >
          {loading ? "Salvando..." : "Gravar Material"}
        </button>
      </div>
    </form>
  );
}