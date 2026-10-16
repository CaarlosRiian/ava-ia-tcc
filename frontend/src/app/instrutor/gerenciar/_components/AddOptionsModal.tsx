"use client";

import { useState } from "react";
import { FolderPlus, FilePlus, BookOpen, X } from "lucide-react";

import { CreateModuleModal } from "./CreateModuleModal";
import { CreateLessonModal } from "./CreateLessonModal";
import { AddMaterialForm } from "./AddMaterialForm";

interface AddOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cursoAtivo: any;
  onAddMaterial: (payload: any) => Promise<void>;
  onCreateModule: (title: string) => Promise<void>;
  onCreateLesson: (data: FormData) => Promise<void>;
  onShowToast: (message: string, type?: "success" | "error") => void; 
}

export function AddOptionsModal({
  isOpen,
  onClose,
  cursoAtivo,
  onAddMaterial,
  onCreateModule,
  onCreateLesson,
  onShowToast, 
}: AddOptionsModalProps) {
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
    <div onClick={handleOverlayClick} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
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
              <CreateModuleModal
                mode="create"
                onSubmit={async (title) => {
                  await onCreateModule(title);
                  handleClose();
                }}
                trigger={
                  <button type="button" className="w-full flex items-center gap-4 p-3 rounded-xl border border-gray-200 hover:border-[#FF7A00] hover:bg-blue-50/30 text-left transition cursor-pointer group">
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

              <CreateLessonModal
                modules={modulosDoCurso}
                mode="create"
                onCreate={async (formData) => {
                  await onCreateLesson(formData);
                  handleClose();
                }}
                trigger={
                  <button type="button" className="w-full flex items-center gap-4 p-3 rounded-xl border border-gray-200 hover:border-[#FF7A00] hover:bg-blue-50/30 text-left transition cursor-pointer group">
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

              <button
                type="button"
                onClick={() => setStep("material")}
                className="w-full flex items-center gap-4 p-3 rounded-xl border border-gray-200 hover:border-[#FF7A00] hover:bg-blue-50/30 text-left transition cursor-pointer group"
              >
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100">
                  <BookOpen size={18} />
                </div>
                <div>
                  <p className="font-semibold text-xs text-gray-800">Material de Apoio</p>
                  <p className="text-[11px] text-gray-400">Forneça apostilas ou resumos para ajudar os alunos no aprendizado.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === "material" && (
          <AddMaterialForm
            onBack={() => setStep("options")}
            onSubmit={handleSubmitMaterial}
            handleClose={handleClose}
            selectedModuleId={selectedModuleId}
            setSelectedModuleId={setSelectedModuleId}
            setSelectedLessonId={setSelectedLessonId}
            selectedLessonId={selectedLessonId}
            modulosDoCurso={modulosDoCurso}
            aulasDoModuloSelecionado={aulasDoModuloSelecionado}
            materialTitle={materialTitle}
            setMaterialTitle={setMaterialTitle}
            materialType={materialType}
            setMaterialType={setMaterialType}
            setRawContent={setRawContent}
            setPdfFile={setPdfFile}
            rawContent={rawContent}
            pdfFile={pdfFile}
            loading={loading}
            onShowToast={onShowToast} 
          />
        )}
      </div>
    </div>
  );
}