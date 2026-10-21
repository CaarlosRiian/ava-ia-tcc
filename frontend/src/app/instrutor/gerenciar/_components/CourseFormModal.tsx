"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CourseUI } from "@/types/course";
import { deleteCourse } from "@/app/instrutor/gerenciar/_services/courses";
import { DeleteCourseModal } from "./DeleteCourseModal";
import { CategoryTagInput } from "./CategoryTagInput"; 
import { Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: any; 
  initialData?: CourseUI | null;
  onCreate: (data: FormData) => Promise<void>;
  onEdit: (courseId: string, data: FormData) => Promise<void>;
};

export function CourseFormModal({ open, onOpenChange, categories, initialData, onCreate, onEdit }: Props) {
  const isEditing = !!initialData;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryIds, setCategoryIds] = useState<number[]>([]); 
  const [price, setPrice] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      
      if (initialData.categories && Array.isArray(initialData.categories)) {
        setCategoryIds(initialData.categories.map((c: any) => typeof c === 'object' ? c.id : c));
      } else if (initialData.category) {
        const singleId = typeof initialData.category === "object" ? initialData.category.id : initialData.category;
        setCategoryIds(singleId ? [Number(singleId)] : []);
      } else {
        setCategoryIds([]);
      }

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
      setCategoryIds([]);
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

  const handleRemoveThumbnail = () => {
    setThumbnail(null);
    setPreview(null);
  };

  async function handleSubmit() {
    if (!title.trim()) {
      return toast.error("Digite o nome do curso");
    }

    if (categoryIds.length === 0) {
      return toast.error("Selecione pelo menos uma categoria");
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price || "0");

    categoryIds.forEach((id) => {
      formData.append("category_ids", id.toString());
    });

    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    try {
      if (isEditing && initialData) {
        await onEdit(initialData.id, formData);
        toast.success("Curso atualizado com sucesso!");
      } else {
        await onCreate(formData);
        toast.success("Curso criado com sucesso!");
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
      toast.success("Curso deletado com sucesso!");
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
        <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-xl border-none">
          <DialogHeader className="pb-4 border-b border-gray-100">
            <DialogTitle className="text-xl font-black text-gray-900">
              {isEditing ? "Editar Informações do Curso" : "Criar Novo Curso"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Preencha os detalhes principais, defina o preço e adicione uma imagem de capa atrativa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Nome do Curso
              </Label>
              <Input
                className="bg-white border-gray-200 rounded-xl h-11 text-sm focus-visible:ring-[#FF7A00]"
                placeholder="Ex: Desenvolvimento Avançado com Next.js"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Descrição do Curso
              </Label>
              <textarea
                className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00] min-h-[100px] text-gray-800 resize-none shadow-sm"
                placeholder="Escreva uma descrição detalhada sobre o que o aluno vai aprender..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <CategoryTagInput
                selectedCategoryIds={categoryIds}
                onChange={setCategoryIds}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-700">Preço do Curso</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-semibold text-sm">
                  R$
                </div>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="pl-9 bg-white border-gray-200 rounded-xl h-11 text-sm focus-visible:ring-[#FF7A00]"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <p className="text-[11px] text-gray-400 font-medium">
                {Number(price) > 0 ? `O curso ficará por R$ ${Number(price).toFixed(2)}` : "Curso gratuito (R$ 0,00)"}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-700">Capa do Curso (Thumbnail)</Label>
              
              {preview ? (
                <div className="relative group rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 p-2 shadow-sm">
                  <img
                    src={preview}
                    alt="Capa do curso"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-2xl">
                    <label className="cursor-pointer bg-white text-gray-900 font-bold text-xs px-4 py-2 rounded-xl shadow-md hover:bg-gray-100 transition">
                      Trocar Imagem
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleRemoveThumbnail}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-md"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Remover
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-[#FF7A00]/50 transition-colors bg-gray-50/50">
                  <div className="p-3 bg-white shadow-sm rounded-2xl w-fit mx-auto mb-2 text-[#FF7A00]">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-bold text-gray-800">Carregar imagem de capa</p>
                  <p className="text-[11px] text-gray-400 mt-0.5 mb-3">Recomendado: 1280x720px (PNG, JPG)</p>
                  
                  <label className="inline-flex">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <span className="bg-[#FF7A00] hover:bg-[#ea7306] text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm transition-all">
                      <Upload className="h-3.5 w-3.5" /> Escolher Ficheiro
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-100 flex items-center justify-between sm:justify-between">
            {isEditing ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setOpenDeleteModal(true)}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs h-11 px-4 rounded-xl shadow-none transition-all cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-1.5" /> Excluir curso
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 h-11 px-5 rounded-xl text-xs font-bold cursor-pointer shadow-sm"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>

              <Button
                type="button"
                onClick={handleSubmit}
                className="bg-[#FF7A00] hover:bg-[#ea7306] text-white h-11 px-6 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
              >
                {isEditing ? "Salvar Alterações" : "Criar Curso"}
              </Button>
            </div>
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