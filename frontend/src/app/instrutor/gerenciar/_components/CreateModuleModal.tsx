"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DeleteModuleModal } from "./DeleteModuleModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderPlus } from "lucide-react";

type Props = {
  mode?: "create" | "edit";
  initialValue?: string;
  trigger?: React.ReactNode;
  onSubmit: (title: string) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export const CreateModuleModal = ({
  mode = "create",
  initialValue = "",
  trigger,
  onSubmit,
  onDelete,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    setTitle(initialValue);
  }, [initialValue, open]);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    try {
      setLoading(true);
      await onSubmit(title);

      setTitle("");
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      setDeleteLoading(true);
      await onDelete();

      setDeleteOpen(false);
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger ?? (
            <Button
              variant="outline"
              className="h-8 text-[11px] font-bold border-gray-200 bg-white hover:bg-gray-50 cursor-pointer rounded-xl"
            >
              + Novo módulo
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="sm:max-w-md rounded-3xl bg-white p-6 shadow-xl border-none">
          <DialogHeader className="pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-50 text-[#FF7A00] rounded-2xl">
                <FolderPlus className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-gray-900">
                  {mode === "edit" ? "Editar Módulo" : "Criar Novo Módulo"}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 mt-0.5">
                  {mode === "edit"
                    ? "Altere o nome deste bloco de aulas."
                    : "Organize seu curso dividindo o conteúdo em blocos."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
              Nome do Módulo
            </label>
            <Input
              placeholder="Ex: Introdução, Prática Avançada..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 rounded-xl border-gray-200 text-sm bg-white focus-visible:ring-[#FF7A00]"
            />
          </div>

          <DialogFooter className="pt-4 border-t border-gray-100 flex items-center justify-between sm:justify-between">
            {mode === "edit" && onDelete ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs h-11 px-4 rounded-xl shadow-none transition-all cursor-pointer"
              >
                Excluir módulo
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 h-11 px-5 rounded-xl text-xs font-bold cursor-pointer shadow-sm"
              >
                Cancelar
              </Button>

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#FF7A00] hover:bg-[#ea7306] text-white h-11 px-6 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
              >
                {loading
                  ? mode === "edit"
                    ? "Salvando..."
                    : "Criando..."
                  : mode === "edit"
                  ? "Salvar Alterações"
                  : "Criar Módulo"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>

        <DeleteModuleModal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          moduleTitle={title}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      </Dialog>
    </>
  );
};