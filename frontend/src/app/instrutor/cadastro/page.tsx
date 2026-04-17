"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";

import { FormHeader } from "./_components/form-header";
import { SocialLinksInput } from "./_components/social-links-input";
import { FileUpload } from "./_components/file-upload";

const especialidades = ["Programação", "Design", "Ciência de Dados", "Inteligência Artificial", "Matemática", "Inglês", "Marketing Digital", "Desenvolvimento Pessoal", "Outro"];

export default function CadastroInstrutor() {
  const [especialidade, setEspecialidade] = useState("");
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!especialidade || !bio.trim()) return toast.error("Preencha os campos obrigatórios.");
    if (!aceiteTermos) return toast.error("Aceite os termos.");

    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      toast.success("Solicitação enviada!");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl mx-auto space-y-8">
          <FormHeader />
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-white border-b border-gray-100 p-8">
              <CardTitle className="text-xl font-bold">Formulário de Cadastro</CardTitle>
              <CardDescription className="font-medium text-gray-400">Campos com * são obrigatórios.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Área de Especialidade <span className="text-red-500">*</span></Label>
                  <Select value={especialidade} onValueChange={setEspecialidade}>
                    <SelectTrigger className="rounded-x cursor-pointer h-12 p-4 border-gray-200 bg-white">
                        <SelectValue placeholder="Selecione sua área principal" />
                    </SelectTrigger>
                    <SelectContent className="z-[99] bg-white"> 
                        {especialidades.map((esp) => (
                        <SelectItem key={esp} value={esp} className="font-medium cursor-pointer">
                            {esp}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Bio Profissional <span className="text-red-500">*</span></Label>
                  <Textarea
                    placeholder="Conte sua trajetória..."
                    className="min-h-[140px] rounded-xl border-gray-200 resize-none p-4"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <SocialLinksInput 
                  linkedin={linkedin} setLinkedin={setLinkedin} 
                  portfolio={portfolio} setPortfolio={setPortfolio} 
                />

                <FileUpload arquivo={arquivo} setArquivo={setArquivo} />

                <div className="flex items-start gap-4 p-5 rounded-xl bg-[#F8F9FA] border border-gray-100">
                  <Checkbox id="termos" checked={aceiteTermos} onCheckedChange={(c) => setAceiteTermos(c === true)} />
                  <Label htmlFor="termos" className="text-sm font-medium text-gray-600 cursor-pointer">
                    Comprometo-me com a qualidade da <span className="text-[#2F52E0] font-bold">AVA-IA</span>. <span className="text-red-500">*</span>
                  </Label>
                </div>

                <Button type="submit" className="w-full bg-[#2F52E0] hover:bg-[#1e3bb3] h-14 rounded-x cursor-pointer text-lg font-bold shadow-lg" disabled={enviando}>
                  {enviando ? "Enviando..." : <><Send className="mr-2 h-5 w-5" /> Enviar Solicitação</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}