"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Lesson, Module } from "@/types/course";

import { Settings, Eye, EyeOff, FileText, Trash2, Link2, Download, MessageSquareCode } from "lucide-react";

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

    if (!lessons.length) {
        return (
            <div className="pl-2 py-2 text-xs text-zinc-400 italic">
                Nenhuma aula ainda
            </div>
        );
    }

    return (
        <div className="space-y-3 pl-2 border-l border-zinc-100">

            {lessons.map((aula, index) => {
                const hasChallenge = Boolean((aula as any).challenge);

                return (
                    <div
                        key={aula.id}
                        className="flex flex-col gap-2 p-3 rounded-2xl border border-zinc-100 bg-white hover:border-blue-100 hover:shadow-sm
                            transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-20 h-12 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
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

                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate text-zinc-800">
                                    {index + 1}. {aula.title}
                                </p>

                                <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                        className={`text-[10px] px-2 py-0 border-none font-semibold
                                            ${aula.status === "publicada"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-amber-100 text-amber-700"
                                            }
                                        `}
                                    >
                                        {aula.status === "publicada" ? "Publicada" : "Rascunho"}
                                    </Badge>
                                </div>
                            </div>

                            <Badge
                                onClick={() => onToggle(cursoId, aula.id)}
                                className={`cursor-pointer flex items-center gap-1 text-[10px] px-2 py-1 border-none font-bold transition-colors
                                    ${aula.visibility === "publico"
                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                        : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                                    }
                                `}
                            >
                                {aula.visibility === "publico" ? (
                                    <> <Eye size={11} /> Público </>
                                ) : (
                                    <> <EyeOff size={11} /> Privado </>
                                )}
                            </Badge>

                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                {hasChallenge && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer gap-1.5 font-medium"
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
                                            className="h-8 w-8 cursor-pointer" >
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
                                    className="h-8 w-8 text-red-500 hover:text-red-600 cursor-pointer" >
                                    <Trash2 size={15} />
                                </Button>
                            </div>
                        </div>

                        {((aula as any).materials && (aula as any).materials.length > 0) && (
                            <div className="mt-1 pl-1 flex flex-col gap-1.5 border-t border-dashed border-zinc-100 pt-2.5 animate-in fade-in duration-200">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                                    Base de Dados da IA & Apoio:
                                </p>
                                <div className="grid grid-cols-1 gap-1.5">
                                    {(aula as any).materials.map((mat: any, idx: number) => {
                                        const isText = mat.formato === "Texto Escrito / Artigo Didático";
                                        const isLink = mat.formato === "Link de Referência Externo";
                                        const tituloMaterial = mat.identificacao || mat.title;

                                        return (
                                            <div 
                                                key={mat.id || idx}
                                                className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 border border-zinc-100 hover:border-zinc-200/80 transition-all text-xs"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className={`p-1 rounded-md shrink-0 ${
                                                        isText ? "bg-purple-100 text-purple-700" :
                                                        isLink ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                                    }`}>
                                                        {isLink ? <Link2 size={12} /> : <FileText size={12} />}
                                                    </div>
                                                    <div className="truncate">
                                                        <p className="font-medium text-zinc-700 truncate max-w-[240px]">{tituloMaterial}</p>
                                                        <p className="text-[9px] text-zinc-400 font-normal leading-none">{mat.formato}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-0.5">
                                                    {!isText && (
                                                        <a 
                                                            href={mat.arquivo_url || mat.arquivo || mat.link_externo} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="p-1 text-zinc-400 hover:text-zinc-600 rounded-md hover:bg-white transition"
                                                            title="Acessar material"
                                                        >
                                                            <Download size={13} />
                                                        </a>
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
                                                        className="p-1 text-zinc-400 hover:text-red-500 rounded-md hover:bg-white transition cursor-pointer"
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