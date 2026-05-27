"use client";

import { Upload, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryFormProps {
  nome: string;
  setNome: (value: string) => void;
  imagemPreview: string | undefined;
  nomeArquivo: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleArquivo: (file: File | null) => void;
  limparFormulario: () => void;
  handleSalvar: (e: React.FormEvent) => void;
}

export function CategoryForm({nome, setNome, imagemPreview, nomeArquivo, inputRef, handleArquivo, limparFormulario, handleSalvar, }: CategoryFormProps) {
  return (
    <Card className="border border-gray-100 shadow-sm rounded-xl bg-white">
      <CardHeader className="p-5 border-b border-gray-50">
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <FolderPlus className="h-5 w-5 text-[#6366F1]" />
          Nova categoria
        </CardTitle>
        <CardDescription className="text-xs">
          Preencha os campos para salvar no banco de dados.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        <form onSubmit={handleSalvar} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-xs font-bold text-gray-700">
              Nome da categoria
            </Label>
            <Input
              id="nome"
              placeholder="Ex.: Desenvolvimento Web"
              className="h-11 rounded-xl border-gray-300 focus-visible:ring-2 focus-visible:ring-[#6366F1]"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-700">Imagem de Capa</Label>
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-[#6366F1]/60 hover:bg-gray-50/50 transition-colors bg-white"
            >
              {imagemPreview ? (
                <div className="space-y-3">
                  <img
                    src={imagemPreview}
                    alt="Pré-visualização"
                    className="mx-auto h-28 w-28 object-cover rounded-xl border border-gray-100 shadow-sm"
                  />
                  <p className="text-xs font-semibold text-gray-700 truncate max-w-[200px] mx-auto">
                    {nomeArquivo}
                  </p>
                  <p className="text-[11px] text-[#6366F1] font-medium">Clique para substituir</p>
                </div>
              ) : (
                <div className="space-y-2 text-gray-400 py-2">
                  <Upload className="h-7 w-7 mx-auto text-gray-400" />
                  <p className="text-xs font-bold text-gray-600">Escolha uma imagem de capa</p>
                  <p className="text-[10px] text-gray-400">PNG, JPG ou WEBP de até 4MB</p>
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleArquivo(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1 h-10 rounded-lg bg-[#6366F1] hover:bg-[#5356E2] font-bold text-xs cursor-pointer">
              Cadastrar categoria
            </Button>
            <Button type="button" variant="outline" onClick={limparFormulario} className="h-10 rounded-lg text-xs font-semibold cursor-pointer">
              Limpar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}