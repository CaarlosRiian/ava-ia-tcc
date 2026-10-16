"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonTitle: string;
  onConfirm: () => Promise<void>;
  loading?: boolean;
};

export function DeleteLessonModal({ open, onOpenChange, lessonTitle, onConfirm, loading,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white rounded-[24px] border border-gray-100 shadow-2xl p-6 max-w-md">
        <AlertDialogHeader className="space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-1">
            <AlertTriangle size={20} />
          </div>

          <AlertDialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
            Excluir aula
          </AlertDialogTitle>

          <AlertDialogDescription asChild>
            <div className="space-y-4 pt-1">
              <p className="text-sm text-gray-500 leading-relaxed">
                Tem certeza que deseja excluir permanentemente esta aula? Esta ação não poderá ser desfeita.
              </p>

              <div className="rounded-2xl border border-red-100 bg-red-50/60 px-4 py-3.5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  Aula selecionada
                </p>
                <p className="text-sm font-bold text-red-700 truncate">
                  {lessonTitle}
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6 flex gap-3 sm:gap-2">
          <AlertDialogCancel className="flex-1 rounded-xl h-11 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition cursor-pointer">
            Cancelar
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={async (e) => {
              e.preventDefault();
              await onConfirm();
            }}
            disabled={loading}
            className="flex-1 rounded-xl h-11 bg-red-500 hover:bg-red-600 text-white font-bold shadow-sm shadow-red-200 transition cursor-pointer"
          >
            {loading ? "Excluindo..." : "Sim, excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}