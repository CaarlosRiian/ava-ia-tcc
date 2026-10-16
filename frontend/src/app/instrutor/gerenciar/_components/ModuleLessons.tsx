"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Lesson, Module } from "@/types/course";

import { Settings, Eye, EyeOff, FileText, Trash2, Link2, Download, MessageSquareCode, ExternalLink, FileCode2 } from "lucide-react";

import { CreateLessonModal } from "./CreateLessonModal";
import { DeleteLessonModal } from "./DeleteLessonModal";
import { DeleteMaterialModal } from "./DeleteMaterialModal"; 
import { LessonSubmissionsModal } from "./LessonSubmissionsModal"; 

type Props = {
    lessons: Lesson[];
    cursoId: string;
    modules: Module[];

    onToggle: (cursoId: string, aulaId: string) => void;
    onDelete: (cursoId: string, aulaId: string) => void;
    onUpdate: (lessonId: string, data: FormData) => Promise<void>;
    onCreate: (formData: FormData) => Promise<void>; 
    onDeleteMaterial: (lessonId: string, materialId: string) => void;
    onOpenAnalytics?: (lesson: any) => void;
};

export function ModuleLessons({ lessons, cursoId, modules, onToggle, onDelete, onUpdate, onCreate, onDeleteMaterial }: Props) {

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [loadingDelete, setLoadingDelete] = useState(false);

    const [deleteMaterialOpen, setDeleteMaterialOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<{ lessonId: string, id: string, title: string } | null>(null);
    const [loadingMaterialDelete, setLoadingMaterialDelete] = useState(false);

    const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
    const [selectedLessonForSubmissions, setSelectedLessonForSubmissions] = useState<Lesson | null>(null);

    const formatUrl = (rawUrl?: string) => {
        if (!rawUrl) return "#";
        if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
            return rawUrl;
        }
        if (rawUrl.startsWith("/")) {
            return `http://localhost:8000${rawUrl}`;
        }
        return `http://localhost:8000/media/${rawUrl}`;
    };

    if (!lessons.length) {
        return (
            <div className="pl-2 py-3 text-xs text-zinc-400 italic bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200 text-center">
                Nenhuma aula cadastrada neste módulo ainda.
            </div>
        );
    }

    return (
        <div className="space-y-3 pl-2 border-l border-zinc-100">

            {lessons.map((aula, index) => {
                const hasChallenge = Boolean((aula as any).challenge);
                const materials = (aula as any).materials || [];

                return (
                    <div
                        key={aula.id}
                        className="flex flex-col gap-3 p-4 rounded-2xl border border-zinc-100 bg-white hover:border-orange-100 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-20 h-12 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-100 shadow-inner">
                                    {aula.thumbnail ? (
                                        <img
                                            src={aula.thumbnail}
                                            alt={aula.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                            <FileText size={16} />
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <p className="font-bold text-sm truncate text-zinc-800 tracking-tight">
                                        {index + 1}. {aula.title}
                                    </p>
                                    <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                                        {materials.length} {materials.length === 1 ? 'material associado' : 'materiais associados'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => onToggle(cursoId, aula.id)}
                                    className={`cursor-pointer flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-semibold transition-all border ${
                                        aula.visibility === "publico"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100"
                                            : "bg-zinc-50 text-zinc-500 border-zinc-200/60 hover:bg-zinc-100"
                                    }`}
                                >
                                    {aula.visibility === "publico" ? (
                                        <> <Eye size={13} /> Público </>
                                    ) : (
                                        <> <EyeOff size={13} /> Privado </>
                                    )}
                                </button>

                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-zinc-50 p-1 rounded-xl border border-zinc-100">
                                    {hasChallenge && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2.5 text-xs text-[#FF7A00] hover:text-[#ea7306] hover:bg-orange-50 cursor-pointer gap-1.5 font-medium rounded-lg"
                                            onClick={() => {
                                                setSelectedLessonForSubmissions(aula);
                                                setSubmissionsModalOpen(true);
                                            }}
                                            title="Ver submissões dos alunos"
                                        >
                                            <MessageSquareCode size={14} />
                                            <span>Submissões</span>
                                        </Button>
                                    )}

                                    <CreateLessonModal
                                        mode="edit"
                                        lesson={aula}
                                        modules={modules}
                                        onUpdate={onUpdate}
                                        onCreate={onCreate} 
                                        trigger={
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 cursor-pointer text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg" 
                                            >
                                                <Settings size={15} />
                                            </Button>
                                        }
                                    />

                                    <Button
                                        onClick={() => {
                                            setSelectedLesson(aula);
                                            setDeleteOpen(true);
                                        }}
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer rounded-lg" 
                                    >
                                        <Trash2 size={15} />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {materials.length > 0 && (
                            <div className="mt-1 pl-2.5 border-t border-dashed border-zinc-100 pt-3 animate-in fade-in duration-200">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]"></span>
                                    Materiais Associados:
                                </p>
                                <div className="grid grid-cols-1 gap-2">
                                    {materials.map((mat: any, idx: number) => {
                                        const formato = (mat.formato || mat.material_type || "").toLowerCase();
                                        const isText = formato.includes("texto") || formato.includes("text") || formato === "text";
                                        const isLink = formato.includes("link") || formato.includes("externo") || formato === "link";
                                        const isPdf = formato.includes("pdf") || formato.includes("arquivo") || formato === "pdf";

                                        const tituloMaterial = mat.identificacao || mat.title;
                                        const rawUrl = mat.arquivo_url || mat.arquivo || mat.file || mat.link_externo || mat.raw_content;
                                        const finalUrl = formatUrl(rawUrl);

                                        return (
                                            <div 
                                                key={mat.id || idx}
                                                className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50/80 border border-zinc-100 hover:border-zinc-200/90 transition-all text-xs"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className={`p-2 rounded-xl shrink-0 flex items-center justify-center ${
                                                        isText ? "bg-orange-50 text-[#FF7A00] border border-orange-100" :
                                                        isLink ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                                                        "bg-amber-50 text-amber-600 border border-amber-100"
                                                    }`}>
                                                        {isText ? <FileText size={14} /> :
                                                         isLink ? <Link2 size={14} /> : 
                                                         <FileCode2 size={14} />}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-zinc-800 truncate max-w-[280px]">
                                                            {tituloMaterial}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] text-zinc-400 font-medium">
                                                                {mat.formato || (isText ? "Texto Escrito" : isLink ? "Link Externo" : "Documento PDF")}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {isLink && (
                                                        <a 
                                                            href={finalUrl.startsWith("http") ? finalUrl : `https://${finalUrl}`}
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition border border-emerald-200/50"
                                                            title="Abrir link externo"
                                                        >
                                                            <ExternalLink size={12} />
                                                            <span>Acessar Link</span>
                                                        </a>
                                                    )}

                                                    {isPdf && (
                                                        <a 
                                                            href={finalUrl} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            download
                                                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition border border-amber-200/50"
                                                            title="Baixar arquivo PDF"
                                                        >
                                                            <Download size={12} />
                                                            <span>Baixar PDF</span>
                                                        </a>
                                                    )}

                                                    {isText && (
                                                        <span className="px-2.5 py-1 text-[10px] font-semibold text-[#FF7A00] bg-orange-50 rounded-lg border border-orange-200/50">
                                                            Contexto IA
                                                        </span>
                                                    )}

                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedMaterial({ 
                                                                lessonId: aula.id, 
                                                                id: mat.id || mat._id, 
                                                                title: tituloMaterial 
                                                            });
                                                            setDeleteMaterialOpen(true);
                                                        }}
                                                        className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-white transition cursor-pointer border border-transparent hover:border-zinc-200"
                                                        title="Excluir material"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {selectedLesson && (
                <DeleteLessonModal
                    open={deleteOpen}
                    onOpenChange={setDeleteOpen}
                    lessonTitle={selectedLesson.title}
                    loading={loadingDelete}
                    onConfirm={async () => {
                        try {
                            setLoadingDelete(true);
                            await onDelete(cursoId, selectedLesson.id);
                            setDeleteOpen(false);
                            setSelectedLesson(null);
                        } catch {
                            setLoadingDelete(false);
                        }
                    }}
                />
            )}

            {selectedMaterial && (
                <DeleteMaterialModal
                    open={deleteMaterialOpen}
                    onOpenChange={setDeleteMaterialOpen}
                    materialTitle={selectedMaterial.title}
                    loading={loadingMaterialDelete}
                    onConfirm={async () => {
                        try {
                            setLoadingMaterialDelete(true);
                            await onDeleteMaterial(selectedMaterial.lessonId, selectedMaterial.id);
                            setDeleteMaterialOpen(false);
                            setSelectedMaterial(null);
                        } catch (error) {
                            console.error("Erro capturado ao deletar material:", error);
                        } finally {
                            setLoadingMaterialDelete(false);
                        }
                    }}
                />
            )}

            {selectedLessonForSubmissions && (
                <LessonSubmissionsModal
                    isOpen={submissionsModalOpen}
                    onOpenChange={setSubmissionsModalOpen}
                    lessonId={selectedLessonForSubmissions.id}
                    lessonTitle={selectedLessonForSubmissions.title}
                />
            )}
        </div>
    );
}