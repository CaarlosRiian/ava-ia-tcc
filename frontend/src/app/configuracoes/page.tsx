"use client";

import { useState } from "react";
import { User, Mail, Shield, Save } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { ProfileHeader } from "./_components/profile-header";
import { InstructorSection } from "./_components/instructor-section";

export default function ConfiguracoesPerfil() {
  const [name, setName] = useState("Rian Carlos");
  const [email, setEmail] = useState("rian.carlos@estudante.com");
  const [bio, setBio] = useState("Estudante de Engenharia focado em desenvolvimento Full Stack e IA.");
  const [isProfessor, setIsProfessor] = useState(false);

  const handleSave = () => {
    toast.success("Perfil atualizado!", { description: "Suas alterações foram salvas." });
  };

  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      <Header />

      <main className="flex-1 container max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#161B1D] tracking-tight text-inter">Configurações</h1>
          <p className="text-gray-500">Gerencie sua conta e preferências.</p>
        </div>

        <div className="space-y-8">
          <ProfileHeader name={name} email={email} initials={initials} />

          <Card className="border-none bg-white shadow-sm rounded-[16px]">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-[#2F52E0]" /> Dados do Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label className="font-bold text-gray-700">Nome completo</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-md p-4" />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold text-gray-700">E-mail</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-md p-4" />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold text-gray-700">Biografia</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="rounded-md p-3 resize-none" />
              </div>
            </CardContent>
          </Card>

          <InstructorSection isProfessor={isProfessor} onToggle={setIsProfessor} />

          <Card className="border-none shadow-sm rounded-[16px] bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#2F52E0]" /> Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <Input type="password" placeholder="Nova senha" className="rounded-md p-4" />
              <Input type="password" placeholder="Confirmar senha" className="rounded-md p-4" />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pb-12">
            <Button variant="ghost" className="p-5 font-bold border-gray-400 cursor-pointer text-gray-400">Descartar</Button>
            <Button onClick={handleSave} className="bg-[#2F52E0] text-white font-black px-8 py-6 rounded-x cursor-pointer flex gap-2">
              <Save className="h-5 w-5" /> Salvar Alterações
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}