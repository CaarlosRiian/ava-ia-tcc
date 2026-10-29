"use client";

import { useState, useMemo } from "react";
import { FolderPlus, Search, Code, Palette, BookOpen, Laptop, BarChart, Cpu, Globe, Database, Layers, Terminal, FileText, ShieldCheck, TrendingUp, Wallet, DollarSign, PiggyBank, CreditCard, Utensils, ChefHat, Coffee, Soup, FlaskConical, Microscope, Dna, HeartPulse, Megaphone, Target, BarChart3, Share2, Briefcase, Building2, Users, PieChart,
  Sparkles, PenTool, Image as ImageIcon, Award, Compass, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DynamicIcon } from "../_components/DynamicIcon";

export const AVAILABLE_ICONS = [
  { name: "Code", label: "Código" },
  { name: "Laptop", label: "Tecnologia" },
  { name: "Globe", label: "Web" },
  { name: "Database", label: "Banco de Dados" },
  { name: "Terminal", label: "Terminal" },
  { name: "Cpu", label: "IA/Hardware" },
  { name: "Layers", label: "Camadas" },
  { name: "ShieldCheck", label: "Segurança" },

  { name: "Palette", label: "Design" },
  { name: "PenTool", label: "Vetor/Caneta" },
  { name: "ImageIcon", label: "Imagens" },
  { name: "Sparkles", label: "Criatividade" },

  { name: "BookOpen", label: "Educação" },
  { name: "FileText", label: "Documentos" },
  { name: "Award", label: "Certificados" },

  { name: "TrendingUp", label: "Investimentos" },
  { name: "Wallet", label: "Carteira" },
  { name: "DollarSign", label: "Finanças" },
  { name: "PiggyBank", label: "Economias" },
  { name: "CreditCard", label: "Pagamentos" },

  { name: "Utensils", label: "Gastronomia" },
  { name: "ChefHat", label: "Culinária" },
  { name: "Coffee", label: "Cafeteria" },
  { name: "Soup", label: "Receitas" },

  { name: "FlaskConical", label: "Química/Ciência" },
  { name: "Microscope", label: "Pesquisa" },
  { name: "Dna", label: "Biologia" },
  { name: "HeartPulse", label: "Saúde" },

  { name: "Megaphone", label: "Marketing" },
  { name: "Target", label: "Estratégia" },
  { name: "BarChart3", label: "Vendas/Gráficos" },
  { name: "Share2", label: "Redes Sociais" },

  { name: "Briefcase", label: "Negócios" },
  { name: "Building2", label: "Empresas" },
  { name: "Users", label: "Gestão de Pessoas" },
  { name: "PieChart", label: "Relatórios" },
  { name: "BarChart", label: "Estatísticas" },

  { name: "Compass", label: "Explorar" },
  { name: "Smile", label: "Bem-estar" },
];

interface CategoryFormProps {
  nome: string;
  setNome: (value: string) => void;
  iconeSelecionado: string;
  setIconeSelecionado: (value: string) => void;
  limparFormulario: () => void;
  handleSalvar: (e: React.FormEvent) => void;
}

export function CategoryForm({ 
  nome, 
  setNome, 
  iconeSelecionado, 
  setIconeSelecionado, 
  limparFormulario, 
  handleSalvar 
}: CategoryFormProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredIcons = useMemo(() => {
    return AVAILABLE_ICONS.filter(
      (item) =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <Card className="border border-gray-100 shadow-sm rounded-xl bg-white">
      <CardHeader className="p-5 border-b border-gray-50">
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <FolderPlus className="h-5 w-5 text-[#FF7A00]" />
          Nova categoria
        </CardTitle>
        <CardDescription className="text-xs">
          Preencha o nome, pesquise e selecione um ícone representativo.
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
              placeholder="Ex.: Finanças & Investimentos"
              className="h-11 rounded-xl border-gray-300 focus-visible:ring-2 focus-visible:ring-[#FF7A00]"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-700">Selecione um Ícone</Label>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar ícone (ex: gastronomia, investimentos)..."
                className="pl-9 h-9 text-xs rounded-lg border-gray-200 focus-visible:ring-1 focus-visible:ring-[#FF7A00]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1 max-h-52 overflow-y-auto p-1 border border-gray-100 rounded-xl bg-gray-50/50">
              {filteredIcons.length === 0 ? (
                <div className="col-span-full text-center py-6 text-xs text-gray-400">
                  Nenhum ícone encontrado.
                </div>
              ) : (
                filteredIcons.map((item) => {
                  const isSelected = iconeSelecionado === item.name;
                  return (
                    <button
                      type="button"
                      key={item.name}
                      onClick={() => setIconeSelecionado(item.name)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-orange-50 border-[#FF7A00] text-[#FF7A00] shadow-sm ring-1 ring-[#FF7A00]"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300"
                      }`}
                    >
                      <DynamicIcon name={item.name} className="h-5 w-5 mb-1" />
                      <span className="text-[10px] font-medium truncate max-w-full">{item.label}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1 h-10 rounded-lg bg-[#FF7A00] hover:bg-[#ea7306] font-bold text-xs text-white cursor-pointer shadow-sm shadow-orange-500/20">
              Cadastrar categoria
            </Button>
            <Button type="button" variant="outline" onClick={() => { limparFormulario(); setSearchTerm(""); }} className="h-10 rounded-lg text-xs font-semibold cursor-pointer">
              Limpar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}