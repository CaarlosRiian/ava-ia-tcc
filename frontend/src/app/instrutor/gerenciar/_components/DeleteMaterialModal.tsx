"use client";

import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

type DeleteMaterialModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    materialTitle: string;
    onConfirm: () => Promise<void>;
    loading?: boolean;
};

export function DeleteMaterialModal({
    open,
    onOpenChange,
    materialTitle,
    onConfirm,
    loading = false,
}: DeleteMaterialModalProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="rounded-2xl bg-white max-w-[440px] p-6 w-[calc(100vw-32px)] border border-zinc-100 shadow-lg">
                <AlertDialogHeader className="space-y-2">
                    <AlertDialogTitle className="text-zinc-900 font-bold text-base text-left">
                        Excluir Material?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-zinc-500 text-sm leading-relaxed text-left mt-2">
                        Você está prestes a remover <strong className="text-zinc-800 font-bold">"{materialTitle}"</strong>.
                        <br />Este arquivo será desvinculado da Aula.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="flex flex-row items-center justify-end gap-2 mt-5 sm:space-x-0 w-full">
                    <AlertDialogCancel
                        disabled={loading}
                        className="rounded-xl text-xs font-semibold h-9 px-4 cursor-pointer mt-0 border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors flex-1 sm:flex-none"
                    >
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={loading}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold h-9 px-4 cursor-pointer flex items-center justify-center gap-1.5 transition-colors border-none shadow-sm flex-1 sm:flex-none"
                    >
                        {loading ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            "Sim, excluir"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}