"use client";

import { useState } from "react";
import { FolderPlus, FilePlus, BookOpen, X, ArrowLeft, Upload } from "lucide-react";

import { CreateModuleModal } from "./CreateModuleModal";
import { CreateLessonModal } from "./CreateLessonModal";

interface AddOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cursoAtivo: any;
  onAddMaterial: (payload: any) => Promise<void>;
  onCreateModule: (title: string) => Promise<void>;
  onCreateLesson: (data: FormData) => Promise<void>;
}

export function AddOptionsModal({isOpen, onClose, cursoAtivo, onAddMaterial, onCreateModule,
  onCreateLesson, }: AddOptionsModalProps) {
  const [step, setStep] = useState<"options" | "material">("options");

  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialType, setMaterialType] = useState("text");
  const [rawContent, setRawContent] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep("options");
    setMaterialTitle("");
    setRawContent("");
    setPdfFile(null);
    setSelectedModuleId("");
    setSelectedLessonId("");
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSubmitMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLessonId || !materialTitle) return;

    setLoading(true);
    try {
      await onAddMaterial({
        lesson: selectedLessonId,
        title: materialTitle,
        material_type: materialType,
        raw_content: materialType === "pdf" ? (pdfFile ? pdfFile.name : null) : rawContent,
        file: materialType === "pdf" ? pdfFile : null, 
      });
      handleClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const modulosDoCurso = cursoAtivo?.modules || [];
  const aulasDoModuloSelecionado =
    modulosDoCurso.find((m: any) => String(m.id) === String(selectedModuleId))?.lessons || [];

  return (
    <div onClick={handleOverlayClick} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" >
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-gray-100 p-6 relative animate-in fade-in zoom-in-95 duration-150">

        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer z-10">
          <X size={18} />
        </button>

        {step === "options" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              O que deseja adicionar?
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Escolha a estrutura que deseja criar no curso ativo.
            </p>

            <div className="space-y-2.5">
              <CreateModuleModal mode="create" onSubmit={async (title) => {
                  await onCreateModule(title);
                  handleClose();
                }}
                trigger={
                  <button type="button" className="w-full flex items-center gap-4 p-3 rounded-xl border border-gray-200 hover:border-[#2F52E0] hover:bg-blue-50/30 text-left transition cursor-pointer group" >
                    <div className="p-2 bg-blue-50 text-[#2F52E0] rounded-lg group-hover:bg-blue-100">
                      <FolderPlus size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-gray-800">Novo Módulo</p>
                      <p className="text-[11px] text-gray-400">Divida seu curso em seções cronológicas.</p>
                    </div>
                  </button>
                }
              />

              <CreateLessonModal modules={modulosDoCurso} mode="create" onCreate={async (formData) => {
                  await onCreateLesson(formData);
                  handleClose();
                }}
                trigger={
                  <button type="button" className="w-full flex items-center gap-4 p-3 rounded-xl border border-gray-200 hover:border-[#2F52E0] hover:bg-blue-50/30 text-left transition cursor-pointer group" >
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100">
                      <FilePlus size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-gray-800">Nova Aula</p>
                      <p className="text-[11px] text-gray-400">Insira um novo conteúdo com suporte a vídeo.</p>
                    </div>
                  </button>
                }
              />

              <button type="button" onClick={() => setStep("material")}
                className="w-full flex items-center gap-4 p-3 rounded-xl border border-gray-200 hover:border-[#2F52E0] hover:bg-blue-50/30 text-left transition cursor-pointer group" >
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100">
                  <BookOpen size={18} />
                </div>
                <div>
                  <p className="font-semibold text-xs text-gray-800">Material de Apoio (IA)</p>
                  <p className="text-[11px] text-gray-400">Forneça apostilas ou resumos para alimentar o Tutor IA.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === "material" && (
          <form onSubmit={handleSubmitMaterial} className="space-y-3.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep("options")}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 transition"
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
                className="w-full rounded-lg border border-gray-200 px-3 h-9 text-xs focus:border-[#2F52E0] outline-none cursor-pointer"
              >
                <option value="">Selecione o Módulo</option>
                {modulosDoCurso.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Aula Vinculada</label>
              <select required value={selectedLessonId} disabled={!selectedModuleId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 h-9 text-xs focus:border-[#2F52E0] outline-none disabled:bg-gray-50 disabled:text-gray-400 cursor-pointer" >
                <option value="">Selecione a Aula</option>
                {aulasDoModuloSelecionado.map((a: any) => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Identificação do Material</label>
              <input type="text" required value={materialTitle} onChange={(e) => setMaterialTitle(e.target.value)} placeholder="Ex: Notas de Aula - Arquitetura de Software" className="w-full rounded-lg border border-gray-200 px-3 h-9 text-xs focus:border-[#2F52E0] outline-none" />
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
                className="w-full rounded-lg border border-gray-200 px-3 h-9 text-xs focus:border-[#2F52E0] outline-none cursor-pointer"
              >
                <option value="text">Texto Escrito / Artigo Didático</option>
                <option value="pdf">Documento PDF (Upload)</option>
                <option value="link">Link de Referência Externo</option>
              </select>
            </div>

            {materialType === "text" && (
              <div className="animate-in fade-in duration-200">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Corpo do Material Escrito</label>
                <textarea
                  required
                  rows={5}
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                  placeholder="Cole aqui o material escrito que a IA irá usar como contexto..."
                  className="w-full rounded-lg border border-gray-200 p-2.5 text-xs focus:border-[#2F52E0] outline-none resize-none font-sans leading-relaxed"
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
                  className="w-full rounded-lg border border-gray-200 px-3 h-9 text-xs focus:border-[#2F52E0] outline-none"
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
              <button type="button" onClick={handleClose} className="px-3 h-8 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 cursor-pointer" >
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="bg-[#2F52E0] hover:bg-[#1e3bb3] px-4 h-8 rounded-lg text-xs font-semibold text-white disabled:bg-gray-400 cursor-pointer shadow-sm transition" >
                {loading ? "Salvando..." : "Gravar Material"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}