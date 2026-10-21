"use client";

import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogCancel 
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle: string;
  onConfirm: () => Promise<void>;
  loading?: boolean;
};

export function RemoveWishlistModal({
  open,
  onOpenChange,
  courseTitle,
  onConfirm,
  loading,
}: Props) {
  const handleConfirmAction = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    try {
      await onConfirm();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white sm:max-w-md rounded-3xl p-6 shadow-xl border-none">
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-2xl">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <AlertDialogTitle className="text-xl font-black text-gray-900">
                Remover da Lista
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-gray-500 mt-0.5">
                Esta ação removerá o curso da sua lista de desejos.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="py-3 space-y-3">
          <p className="text-xs font-semibold text-gray-600">
            Tem certeza que deseja remover o curso abaixo?
          </p>

          <div className="rounded-2xl border border-red-100 bg-red-50/60 px-4 py-3">
            <p className="text-xs font-bold text-red-700 truncate">
              {courseTitle}
            </p>
          </div>
        </div>

        <AlertDialogFooter className="pt-4 border-t border-gray-100 flex items-center justify-between sm:justify-between">
          <AlertDialogCancel asChild>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 h-11 px-5 rounded-xl text-xs font-bold cursor-pointer shadow-sm"
            >
              Cancelar
            </Button>
          </AlertDialogCancel>

          <Button
            type="button"
            onClick={handleConfirmAction}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white h-11 px-6 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
          >
            {loading ? "Removendo..." : "Sim, Remover"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}