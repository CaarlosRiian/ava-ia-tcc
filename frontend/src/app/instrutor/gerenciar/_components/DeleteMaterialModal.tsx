"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Loader2 } from "lucide-react";

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
      <AlertDialogContent className="bg-white rounded-[24px] border border-gray-100 shadow-2xl p-6 w-full max-w-md mx-auto overflow-hidden">
        <AlertDialogHeader className="space-y-3 text-left">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-1">
            <AlertTriangle size={20} />
          </div>

          <AlertDialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
            Excluir Material
          </AlertDialogTitle>

          <AlertDialogDescription asChild>
            <div className="space-y-4 pt-1 w-full overflow-hidden">
              <p className="text-sm text-gray-500 leading-relaxed break-words">
                Você está prestes a remover este material. Este arquivo será desvinculado da aula e a ação não poderá ser desfeita.
              </p>

              <div className="rounded-2xl border border-red-100 bg-red-50/60 px-4 py-3.5 w-full overflow-hidden">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  Material selecionado
                </p>
                <p className="text-sm font-bold text-red-700 break-words leading-snug">
                  {materialTitle}
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6 flex gap-3 sm:gap-2">
          <AlertDialogCancel
            disabled={loading}
            className="flex-1 rounded-xl h-11 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition cursor-pointer"
          >
            Cancelar
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={async (e) => {
              e.preventDefault();
              await onConfirm();
            }}
            disabled={loading}
            className="flex-1 rounded-xl h-11 bg-red-500 hover:bg-red-600 text-white font-bold shadow-sm shadow-red-200 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Excluindo...
              </>
            ) : (
              "Sim, excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}