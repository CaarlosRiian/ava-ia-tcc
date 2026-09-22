"use client";

import { useState, useEffect } from "react";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CourseUI } from "@/types/course";
import { deleteCourse } from "@/app/instrutor/gerenciar/_services/courses";
import { DeleteCourseModal } from "./DeleteCourseModal";

import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  categories: { id: string; name: string }[];

  initialData?: CourseUI | null;

  onCreate: (data: FormData) => Promise<void>;

  onEdit: (
    courseId: string,
    data: FormData
  ) => Promise<void>;
};

export function CourseFormModal({ open, onOpenChange, categories, initialData, onCreate, onEdit }: Props) {
  const isEditing = !!initialData;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setCategory(
        typeof initialData.category === "object"
          ? initialData.category.id
          : initialData.category || ""
      );
      setPrice(initialData.price?.toString() || "");

      if (initialData.thumbnail) {
        if (initialData.thumbnail.startsWith("http://") || initialData.thumbnail.startsWith("https://")) {
          setPreview(initialData.thumbnail);
        } else {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "").replace(/\/$/, "") || "";
          const thumbUrl = initialData.thumbnail.startsWith("/") ? initialData.thumbnail : `/${initialData.thumbnail}`;
          setPreview(`${baseUrl}${thumbUrl}`);
        }
      } else {
        setPreview(null);
      }
      setThumbnail(null);
    } else {
      setTitle("");
      setDescription("");
      setCategory("");
      setPrice("");
      setThumbnail(null);
      setPreview(null);
    }
  }, [initialData, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  async function handleSubmit() {
    if (!title.trim()) {
      return toast.error("Digite o nome do curso");
    }

    if (!category) {
      return toast.error("Selecione uma categoria");
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("price", price || "0");

    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }
    try {
      if (isEditing && initialData) {
        await onEdit(initialData.id, formData);

        console.log("EDIT:", isEditing, initialData?.id);

        toast.success("Curso atualizado!");
      } else {
        await onCreate(formData);

        toast.success("Curso criado!");
      }

      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar curso");
    }
  }

  async function handleDelete() {
    if (!initialData) return;

    try {
      setLoadingDelete(true);

      await deleteCourse(initialData.id);

      toast.success("Curso deletado!");

      setOpenDeleteModal(false);

      onOpenChange(false);
    } catch (err) {
      console.error(err);

      toast.error("Erro ao deletar curso");
    } finally {
      setLoadingDelete(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar curso" : "Criar novo curso"}
            </DialogTitle>

            <DialogDescription>
              Preencha as informações do curso.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Nome
              </Label>

              <Input
                className="bg-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Descrição
              </Label>

              <Input
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>

              <select
                className="w-full border rounded-md p-2 cursor-pointer"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
              >
                <option value="">Selecione</option>

                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Preço</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Capa do curso</Label>

              {preview && (
                <div className="space-y-2">
                  <img
                    src={preview}
                    alt="Thumbnail do curso"
                    className="w-full h-40 object-cover rounded-md border"
                  />
                  <p className="text-xs text-gray-500">
                    {thumbnail ? "Nova imagem selecionada" : "Imagem atual do curso"}
                  </p>
                </div>
              )}

              <Input
                className="cursor-pointer"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setThumbnail(
                    e.target.files?.[0] || null
                  )
                }
              />
            </div>
          </div>

          <DialogFooter>
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setOpenDeleteModal(true)}
                className="gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-x shadow-md hover:shadow-red-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                Excluir curso
              </Button>
            )}

            <Button
              className="bg-white text-black border-gray-400 hover:border-red-600 p-4 cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button
              onClick={handleSubmit}
              className="bg-[#FF7A00] hover:bg-[#ea7306] p-4 cursor-pointer"
            >
              {isEditing
                ? "Salvar alterações"
                : "Criar curso"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DeleteCourseModal
        open={openDeleteModal}
        onOpenChange={setOpenDeleteModal}
        courseTitle={initialData?.title || ""}
        loading={loadingDelete}
        onConfirm={handleDelete}
      />
    </>
  );
}
