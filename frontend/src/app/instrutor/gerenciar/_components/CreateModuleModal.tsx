"use client";

import { useEffect, useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, } from "@/components/ui/dialog";
import { DeleteModuleModal } from "./DeleteModuleModal"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      console.log(error);
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
      console.log(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            className="h-8 text-[11px] font-bold border-gray-200 bg-white hover:bg-gray-50 cursor-pointer">
            Novo módulo
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-2xl bg-white">
        <DialogHeader className="space-y-3">
          <div>
            <DialogTitle className="text-xl">
              {mode === "edit" ? "Editar módulo" : "Criar módulo"}
            </DialogTitle>

            <DialogDescription className="mt-1">
              {mode === "edit"
                ? "Edite o nome do módulo."
                : "Adicione um novo módulo ao curso."}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="py-3">
          <label className="block mb-3 text-sm font-medium text-zinc-700">
            Nome do módulo
          </label>

          <Input
            placeholder="Ex: Introdução, Projeto final..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-11 rounded-xl"
          />
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          {mode === "edit" && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
              className="mr-auto bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-x cursor-pointer"
            >
              Excluir módulo
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="bg-white text-black border-gray-400 hover:border-red-600 p-4 cursor-pointer"
          >
            Cancelar
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#FF7A00] hover:bg-[#ea7306] p-4 cursor-pointer"
          >
            {loading
              ? mode === "edit"
                ? "Salvando..."
                : "Criando..."
              : mode === "edit"
                ? "Salvar"
                : "Criar módulo"}
          </Button>
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
  );
};