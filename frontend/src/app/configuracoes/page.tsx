"use client";

import { useState, useEffect } from "react";
import { getMe, updateMe } from "@/services/auth";
import { Save, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

import { ProfileHeader } from "./_components/profile-header";
import { ProfileSkeleton } from "./_components/ProfileSkeleton";
import { ProfileDataForm } from "./_components/ProfileDataForm";
import { SecurityForm } from "./_components/SecurityForm";
import { FormStatusBadge } from "./_components/FormStatusBadge";
import { formatName } from "@/utils/formatName";

export default function ConfiguracoesPerfil() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [userRole, setUserRole] = useState(""); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [initialData, setInitialData] = useState({ name: "", email: "", bio: "" });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("access");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getMe(token);
        const formattedName = data.name ? formatName(data.name) : "";
        const userEmail = data.email || "";
        const userBio = data.bio || "";

        setName(formattedName);
        setEmail(userEmail);
        setBio(userBio);
        setUserRole(data.role || "");

        setInitialData({ name: formattedName, email: userEmail, bio: userBio });
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        toast.error("Não foi possível carregar os dados do perfil.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const hasUnsavedChanges =
    name !== initialData.name ||
    email !== initialData.email ||
    bio !== initialData.bio ||
    password !== "";

  useEffect(() => {
    if (hasUnsavedChanges) {
      setSaveSuccess(false);
      setErrorMessage(null);
    }
  }, [name, email, bio, password]);

  const handleSave = async () => {
    setErrorMessage(null);
    setSaveSuccess(false);

    const token = localStorage.getItem("access");
    if (!token) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }

    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        setErrorMessage("As senhas não coincidem!");
        return;
      }
      if (password.length < 6) {
        setErrorMessage("A senha deve ter ao menos 6 caracteres.");
        return;
      }
    }

    try {
      setIsSaving(true);
      const payload: any = { name, email, bio };

      if (password) {
        payload.password = password;
      }

      await updateMe(token, payload);

      setSaveSuccess(true);
      setInitialData({ name, email, bio });
      setPassword("");
      setConfirmPassword("");
      toast.success("Perfil atualizado!");

      setTimeout(() => {
        setSaveSuccess(false);
      }, 4000);

    } catch (error: any) {
      console.error("Erro ao atualizar o perfil:", error);
      setErrorMessage(error.message || "Erro ao salvar alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
        <Header />
        <main className="flex-1 container max-w-3xl mx-auto px-6 py-12">
          <ProfileSkeleton />
        </main>
      </div>
    );
  }

  const initials = name
    ? name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      <Header />

      <main className="flex-1 container max-w-3xl mx-auto px-6 py-12 relative">
        <div className="mb-6">
          <Link href="/descobrir">
            <Button variant="ghost" className="gap-2 text-gray-600 hover:text-[#2F52E0] pl-0 cursor-pointer transition-colors">
              <ArrowLeft className="h-4 w-4" /> Voltar para Descobrir
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#161B1D] tracking-tight text-inter">Configurações</h1>
          <p className="text-gray-500">Gerencie sua conta e preferências.</p>
        </div>

        <div className="space-y-8">
          <ProfileHeader name={name} email={email} initials={initials} role={userRole} />

          <ProfileDataForm
            name={name} setName={setName}
            email={email} setEmail={setEmail}
            bio={bio} setBio={setBio}
          />

          <SecurityForm
            password={password} setPassword={setPassword}
            confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
          />

          <div className="flex justify-end gap-4 pb-12">
            <Button
              variant="ghost"
              className="p-5 font-bold border-gray-400 cursor-pointer text-gray-400 hover:text-gray-600"
              disabled={isSaving}
              onClick={() => {
                setName(initialData.name);
                setEmail(initialData.email);
                setBio(initialData.bio);
                setPassword("");
                setConfirmPassword("");
                setErrorMessage(null);
                setSaveSuccess(false);
                toast.info("Alterações descartadas.");
              }}
            >
              Descartar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="bg-[#2F52E0] hover:bg-[#2442b8] text-white font-black px-8 py-6 rounded-xl cursor-pointer flex gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <Save className="h-5 w-5" />
              Salvar Alterações
            </Button>
          </div>
        </div>

        <FormStatusBadge
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
          errorMessage={errorMessage}
          saveSuccess={saveSuccess}
        />
      </main>
    </div>
  );
}