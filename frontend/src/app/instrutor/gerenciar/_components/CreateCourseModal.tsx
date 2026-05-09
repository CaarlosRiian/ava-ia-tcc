"use client";

import { useState } from "react";

import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Plus } from "lucide-react";
import { toast } from "sonner";

type Props = {
  onCreate: (data: FormData) => Promise<void>;
  categories: { id: string; name: string }[];
};

export function CreateCourseModal({ onCreate, categories }: Props) {
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  async function handleSubmit() {
    if (!title.trim()) return toast.error("Digite o nome do curso");
    if (!category) return toast.error("Selecione uma categoria");

    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("price", price || "0");
    formData.append("published", "false");

    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    try {
      await onCreate(formData);

      toast.success("Curso criado!");

      setTitle("");
      setDescription("");
      setCategory("");
      setPrice("");
      setThumbnail(null);
      setOpen(false);
    } catch (err) {
      toast.error("Erro ao criar curso");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#2F52E0] hover:bg-[#1e3bb3] h-9 px-4 rounded-lg text-sm font-semibold cursor-pointer shadow-sm">
          <Plus className="h-4 w-4 mr-1" />
          Novo Curso
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Criar novo curso</DialogTitle>
          <DialogDescription>
            Preencha as informações do curso.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Nome</Label>
            <Input className="bg-white" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Descrição</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <select
              className="w-full border rounded-md p-2 cursor-pointer"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
            <Input className="cursor-pointer"
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button className="bg-red-500 text-white hover:bg-red-600 p-4 cursor-pointer"
            onClick={() => setOpen(false)}>
            Cancelar
          </Button>

          <Button onClick={handleSubmit} className="bg-[#2F52E0] hover:bg-[#1e3bb3] p-4 cursor-pointer">
            Criar Curso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}