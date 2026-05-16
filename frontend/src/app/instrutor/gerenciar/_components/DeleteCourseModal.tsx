"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  courseTitle: string;

  onConfirm: () => Promise<void>;

  loading?: boolean;
};

export function DeleteCourseModal({ open, onOpenChange, courseTitle, onConfirm, loading, }: Props) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Excluir curso
          </AlertDialogTitle>

          <AlertDialogDescription asChild>
            <div className="space-y-5">
              <p className="text-sm text-zinc-600 leading-relaxed">
                Tem certeza que deseja excluir este curso?
              </p>

              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-sm font-semibold text-red-700">
                  {courseTitle}
                </p>
              </div>

              <div className="rounded-lg bg-zinc-100 px-4 py-3 ">
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Esta ação é permanente e não poderá ser desfeita.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">
            Cancelar
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 cursor-pointer"
          >
            {loading
              ? "Excluindo..."
              : "Excluir curso"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}