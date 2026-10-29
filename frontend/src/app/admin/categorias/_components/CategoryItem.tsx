"use client";

import { useState } from "react";
import { Settings, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DynamicIcon } from "../_components/DynamicIcon";
import { AVAILABLE_ICONS } from "./CategoryForm";

interface Categoria {
    id: string;
    name: string;
    icon?: string;
}

interface CategoryItemProps {
    categoria: Categoria;
    handleRemover: (id: string) => void;
    handleEditar: (id: string, novoNome: string, novoIcone: string) => Promise<void>;
}

export function CategoryItem({ categoria, handleRemover, handleEditar }: CategoryItemProps) {
    const [modalDeletarAberto, setModalDeletarAberto] = useState(false);
    const [modalEditarAberto, setModalEditarAberto] = useState(false);

    const [novoNome, setNovoNome] = useState(categoria.name);
    const [novoIcone, setNovoIcone] = useState(categoria.icon || "Code");

    const preConfirmarExclusao = () => {
        handleRemover(categoria.id);
        setModalDeletarAberto(false);
    };

    const salvarEdicao = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!novoNome.trim()) {
            toast.error("O nome da categoria não pode ficar vazio.");
            return;
        }

        await handleEditar(categoria.id, novoNome, novoIcone);
        setModalEditarAberto(false);
    };

    return (
        <>
            <li className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white shadow-2xs hover:bg-gray-50/50 transition-colors">
                <div className="h-11 w-11 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center overflow-hidden shrink-0 text-[#FF7A00]">
                    <DynamicIcon name={categoria.icon || "Folder"} className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{categoria.name}</p>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                        >
                            <Settings className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36 rounded-xl border-gray-100 shadow-md bg-white">
                        <DropdownMenuItem
                            onClick={() => setModalEditarAberto(true)}
                            className="flex items-center gap-2 text-xs font-medium cursor-pointer py-2 text-gray-700 focus:bg-orange-50 focus:text-[#FF7A00]"
                        >
                            <Pencil className="h-3.5 w-3.5 text-gray-400" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setModalDeletarAberto(true)}
                            className="flex items-center gap-2 text-xs font-medium cursor-pointer py-2 text-red-600 focus:text-red-600 focus:bg-red-50/50"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </li>

            <Dialog open={modalDeletarAberto} onOpenChange={setModalDeletarAberto}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl border-gray-100 p-6 bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-gray-900">Excluir Categoria</DialogTitle>
                        <DialogDescription className="text-xs text-gray-500 pt-2">
                            Tem certeza que deseja excluir a categoria <strong className="text-gray-800">"{categoria.name}"</strong>? Esta ação não poderá ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-row justify-end gap-3 pt-5 p-4 sm:space-x-0">
                        <Button variant="outline" onClick={() => setModalDeletarAberto(false)} className="rounded-lg text-xs font-semibold h-9 flex-1 sm:flex-none cursor-pointer">
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={preConfirmarExclusao} className="rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 h-9 flex-1 sm:flex-none text-white cursor-pointer">
                            Confirmar Exclusão
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={modalEditarAberto} onOpenChange={setModalEditarAberto}>
                <DialogContent className="sm:max-w-[450px] rounded-2xl border-gray-100 p-6 bg-white">
                    <form onSubmit={salvarEdicao}>
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold text-gray-900">Editar Categoria</DialogTitle>
                            <DialogDescription className="text-xs text-gray-500 pt-1">
                                Altere o nome ou o ícone representativo da categoria.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-nome" className="text-xs font-bold text-gray-700">
                                    Nome da Categoria
                                </Label>
                                <Input
                                    id="edit-nome"
                                    value={novoNome}
                                    onChange={(e) => setNovoNome(e.target.value)}
                                    className="h-10 rounded-xl border-gray-300 focus-visible:ring-2 focus-visible:ring-[#FF7A00]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-700">Selecione o Ícone</Label>
                                <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 border border-gray-200 rounded-xl bg-gray-50/50">
                                    {AVAILABLE_ICONS.map((item) => {
                                        const isSelected = novoIcone === item.name;
                                        return (
                                            <button
                                                type="button"
                                                key={item.name}
                                                onClick={() => setNovoIcone(item.name)}
                                                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "bg-orange-50 border-[#FF7A00] text-[#FF7A00] shadow-2xs"
                                                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
                                                }`}
                                            >
                                                <DynamicIcon name={item.name} className="h-4 w-4 mb-1" />
                                                <span className="text-[9px] font-medium truncate max-w-full">{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="flex flex-row justify-end gap-3 pt-3 sm:space-x-0">
                            <Button type="button" variant="outline" onClick={() => setModalEditarAberto(false)} className="rounded-lg text-xs font-semibold h-9 flex-1 sm:flex-none cursor-pointer">
                                Cancelar
                            </Button>
                            <Button type="submit" className="rounded-lg text-xs font-bold bg-[#FF7A00] hover:bg-[#ea7306] text-white h-9 flex-1 sm:flex-none cursor-pointer">
                                Salvar Alterações
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}