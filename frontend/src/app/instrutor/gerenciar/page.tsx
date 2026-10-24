"use client";

import { useState } from "react";
import axios from "axios";
import { Settings, BarChart3, GraduationCap, Video } from "lucide-react";

import Header from "@/components/Header";
import Breadcrumb from "@/components/BreadCrumb";
import Toast from "@/components/ui/Toast";
import { CourseCard } from "./_components/CourseCard-Item";
import { LessonManager } from "./_components/LessonManager";
import { CourseFormModal } from "./_components/CourseFormModal";
import { AddOptionsModal } from "./_components/AddOptionsModal";
import { EditObjectivesModal } from "./_components/EditObjectivesModal";
import { IntroVideoModal } from "./_components/IntroVideoModal";
import { useCourseManagement } from "./_hooks/useCourseManagement";
import { createCourse, updateCourse } from "./_services/courses";
import { createMaterial } from "./_services/materials";
import Footer from "@/components/Footer";

export default function GerenciamentoAulas() {
  const { cursos, cursoSelecionado, setCursoSelecionado, categories, cursoAtivo, toastConfig, showToast, hideToast, handleCreateModule, handleCreateLesson, setCursos,
  } = useCourseManagement();

  const [openAddOptionsModal, setOpenAddOptionsModal] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [openObjectivesModal, setOpenObjectivesModal] = useState(false);
  const [openIntroVideoModal, setOpenIntroVideoModal] = useState(false);

  const handleToggle = async (cId: string, aId: string) => {
    setCursos((prev) =>
      prev.map((c) =>
        String(c.id) === String(cId)
          ? {
              ...c,
              aulas: c.aulas.map((a: any) =>
                a.id === aId ? { ...a, status: a.status === "publicada" ? "rascunho" : "publicada" } : a
              ),
            }
          : c
      )
    );
    showToast("Status atualizado com sucesso!");
  };

  const handleDelete = (cId: string, aId: string) => {
    setCursos((prev) =>
      prev.map((c) =>
        String(c.id) === String(cId)
          ? { ...c, aulas: c.aulas.filter((a: any) => a.id !== aId) }
          : c
      )
    );
    showToast("Aula removida.");
  };

  const handleCreateCourse = async (formData: FormData) => {
    try {
      const newCourse = await createCourse(formData);
      setCursos((prev) => [{ ...newCourse, aulas: [] }, ...prev]);
      showToast("Curso criado com sucesso!");
    } catch (err) {
      showToast("Erro ao criar curso", "error");
    }
  };

  const handleUpdateCourse = async (courseId: string, formData: FormData) => {
    try {
      const updated = await updateCourse(courseId, formData);
      setCursos((prev) =>
        prev.map((curso) =>
          String(curso.id) === String(courseId)
            ? { ...curso, ...updated, aulas: updated.modules?.flatMap((m: any) => m.lessons) || [] }
            : curso
        )
      );
      showToast("Curso atualizado com sucesso!");
    } catch (err) {
      showToast("Erro ao atualizar curso", "error");
    }
  };

  const handleSaveObjectives = async (objectives: string[]) => {
    if (!cursoAtivo) return;

    try {
      const token = localStorage.getItem("access");
      const response = await axios.patch(
        `http://localhost:8000/api/courses/${cursoAtivo.id}/`,
        { learning_objectives: objectives },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCursos((prev) =>
        prev.map((c) =>
          String(c.id) === String(cursoAtivo.id)
            ? { ...c, ...response.data }
            : c
        )
      );

      showToast("Objetivos atualizados com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao salvar objetivos:", error);
      showToast("Falha ao salvar objetivos de aprendizado.", "error");
      throw error;
    }
  };

  const handleSaveIntroVideo = async (videoPath: string | null) => {
    if (!cursoAtivo) return;

    try {
      const token = localStorage.getItem("access");
      const response = await axios.patch(
        `http://localhost:8000/api/courses/${cursoAtivo.id}/`,
        { intro_video: videoPath },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCursos((prev) =>
        prev.map((c) =>
          String(c.id) === String(cursoAtivo.id)
            ? { ...c, ...response.data }
            : c
        )
      );
    } catch (error) {
      console.error("Erro ao salvar aula introdutória:", error);
      throw error;
    }
  };

  const handleAddMaterial = async (payload: any) => {
    try {
      const formData = new FormData();
      formData.append("lesson", String(payload.lesson));
      formData.append("title", payload.title);
      formData.append("material_type", payload.material_type);

      if (payload.file) formData.append("file", payload.file);
      else if (payload.raw_content) formData.append("raw_content", payload.raw_content);

      const novoMaterialSalvo = await createMaterial(formData);
      showToast("Material de apoio integrado ao banco da IA!");

      if (cursoAtivo) {
        setCursos((prev) =>
          prev.map((c) =>
            String(c.id) === String(cursoSelecionado)
              ? {
                  ...c,
                  modules: c.modules?.map((m: any) => ({
                    ...m,
                    lessons: m.lessons?.map((l: any) =>
                      String(l.id) === String(payload.lesson)
                        ? { ...l, materials: [...(l.materials || []), novoMaterialSalvo] }
                        : l
                    ),
                  })),
                }
              : c
          )
        );
      }
    } catch (err) {
      showToast("Falha ao salvar material didático.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <Header />
      <Breadcrumb items={[{ label: "Gerenciar cursos" }]} />

      <main className="flex-1 max-w-6xl w-full mx-auto pt-6 pb-12 px-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Gerenciamento</h1>
            <p className="text-sm text-muted-foreground">Administre seus cursos e conteúdos didáticos</p>
          </div>
          <button
            onClick={() => { setEditingCourse(null); setOpenModal(true); }}
            className="bg-[#FF7A00] hover:bg-[#ea7306] h-10 px-5 rounded-xl text-sm font-bold cursor-pointer shadow-sm text-white transition flex items-center gap-2"
          >
            + Novo Curso
          </button>
          <CourseFormModal
            open={openModal}
            onOpenChange={setOpenModal}
            categories={categories}
            initialData={editingCourse}
            onCreate={handleCreateCourse}
            onEdit={handleUpdateCourse}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="space-y-3">
            <h2 className="font-bold text-base px-1 flex items-center gap-2 text-gray-700">
              <Settings size={18} className="text-[#FF7A00]" /> Seus Cursos
            </h2>
            <div className="space-y-2.5">
              {cursos.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-gray-200 rounded-2xl bg-white text-gray-400 text-xs">
                  Nenhum curso cadastrado ainda.
                </div>
              ) : (
                cursos.map((c) => (
                  <CourseCard
                    key={c.id}
                    curso={{ ...c, alunos: c.alunos ?? 0 }}
                    isSelected={String(cursoSelecionado) === String(c.id)}
                    onClick={() => setCursoSelecionado(String(c.id))}
                    onEdit={() => { setEditingCourse(c); setOpenModal(true); }}
                  />
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {cursoAtivo && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF7A00] bg-orange-50 px-2.5 py-1 rounded-lg">
                      Métricas do Curso
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-1">{cursoAtivo.title}</h3>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenIntroVideoModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-[#FF7A00] hover:bg-orange-100 font-bold text-xs transition border border-orange-100 cursor-pointer"
                    >
                      <Video size={15} />
                      <span>Aula Introdutória</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOpenObjectivesModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 font-bold text-xs transition border border-gray-200 cursor-pointer"
                    >
                      <GraduationCap size={15} />
                      <span>Objetivos</span>
                    </button>
                    <BarChart3 className="h-5 w-5 text-[#FF7A00] ml-1" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                    <span className="text-xs text-gray-500 font-semibold">Alunos</span>
                    <p className="text-xl font-black text-gray-900">{cursoAtivo.alunos || 0}</p>
                  </div>
                  <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                    <span className="text-xs text-gray-500 font-semibold">Média Geral</span>
                    <p className="text-xl font-black text-amber-600">4.9</p>
                  </div>
                  <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                    <span className="text-xs text-gray-500 font-semibold">Novos/Semana</span>
                    <p className="text-xl font-black text-emerald-600">+{Math.ceil((cursoAtivo.alunos || 1) * 0.15)}</p>
                  </div>
                  <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                    <span className="text-xs text-gray-500 font-semibold">Total Aulas</span>
                    <p className="text-xl font-black text-gray-900">{cursoAtivo.aulas?.length || 0}</p>
                  </div>
                </div>
              </div>
            )}

            <LessonManager
              curso={cursoAtivo as any}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onOpenAddOptions={() => setOpenAddOptionsModal(true)}
              onOpenAnalytics={() => {}}
              onShowToast={showToast}
            />
          </div>
        </div>
      </main>

      <AddOptionsModal
        isOpen={openAddOptionsModal}
        onClose={() => setOpenAddOptionsModal(false)}
        cursoAtivo={cursoAtivo}
        onAddMaterial={handleAddMaterial}
        onCreateModule={handleCreateModule}
        onCreateLesson={handleCreateLesson}
        onShowToast={showToast}
      />

      {cursoAtivo && (
        <>
          <EditObjectivesModal
            open={openObjectivesModal}
            onOpenChange={setOpenObjectivesModal}
            courseId={cursoAtivo.id}
            initialObjectives={cursoAtivo.learning_objectives || []}
            onSave={handleSaveObjectives}
            onShowToast={showToast}
          />

          <IntroVideoModal
            open={openIntroVideoModal}
            onOpenChange={setOpenIntroVideoModal}
            courseId={cursoAtivo.id}
            currentVideoUrl={cursoAtivo.intro_video}
            onSave={handleSaveIntroVideo}
            onShowToast={showToast}
          />
        </>
      )}

      <Toast message={toastConfig.message} type={toastConfig.type} onClose={hideToast} />
      <Footer />
    </div>
  );
}