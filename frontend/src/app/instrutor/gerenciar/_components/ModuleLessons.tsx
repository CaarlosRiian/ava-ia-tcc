"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Lesson, Module } from "@/types/course";

import { Settings, Eye, EyeOff, FileText, Trash2, BookOpen } from "lucide-react";

import { CreateLessonModal } from "./CreateLessonModal";
import { DeleteLessonModal } from "./DeleteLessonModal";

type Props = {
    lessons: Lesson[];
    cursoId: string;
    modules: Module[];

    onToggle: (cursoId: string, aulaId: string) => void;
    onDelete: (cursoId: string, aulaId: string) => void;
    onUpdate: (lessonId: string, data: FormData) => Promise<void>;
};

export function ModuleLessons({ lessons, cursoId, modules, onToggle, onDelete, onUpdate }: Props) {

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [loadingDelete, setLoadingDelete] = useState(false);

    if (!lessons.length) {
        return (
            <div className="pl-2 py-2 text-xs text-zinc-400 italic">
                Nenhuma aula ainda
            </div>
        );
    }

    return (
        <div className="space-y-3 pl-2 border-l border-zinc-100">

            {lessons.map((aula, index) => (
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
                                <>
                                    <Eye size={11} />
                                    Público
                                </>
                            ) : (
                                <>
                                    <EyeOff size={11} />
                                    Privado
                                </>
                            )}
                        </Badge>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <CreateLessonModal
                                mode="edit"
                                lesson={aula}
                                modules={modules}
                                onUpdate={onUpdate}
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
                        <div className="mt-1 pl-1 flex flex-wrap gap-1.5 border-t border-dashed border-zinc-100 pt-2 animate-in fade-in duration-200">
                            {(aula as any).materials.map((mat: any, idx: number) => (
                                <div 
                                    key={mat.id || idx}
                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-medium"
                                >
                                    <BookOpen size={10} className="text-purple-500 shrink-0" />
                                    <span className="truncate max-w-[220px]">{mat.title}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            {selectedLesson && (
                <DeleteLessonModal
                    open={deleteOpen}
                    onOpenChange={setDeleteOpen}
                    lessonTitle={selectedLesson.title}
                    loading={loadingDelete}
                    onConfirm={async () => {
                        try {
                            setLoadingDelete(true);

                            await onDelete(
                                cursoId,
                                selectedLesson.id
                            );

                            setDeleteOpen(false);
                            setSelectedLesson(null);
                        } finally {
                            setLoadingDelete(false);
                        }
                    }}
                />
            )}
        </div>
    );
}