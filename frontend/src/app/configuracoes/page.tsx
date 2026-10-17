"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { getMe, updateMe } from "@/services/auth";
import { Save } from "lucide-react";
import Header from "@/components/Header";
import Breadcrumb from "@/components/BreadCrumb"; 
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner"; 

import { ProfileHeader } from "./_components/profile-header";
import { ProfileSkeleton } from "./_components/ProfileSkeleton";
import { ProfileDataForm } from "./_components/ProfileDataForm";
import { InterestsForm } from "./_components/InterestsForm";
import { SpecialtiesForm } from "./_components/SpecialtiesForm";
import { SecurityForm } from "./_components/SecurityForm";
import { formatName } from "@/utils/formatName";
import Footer from "@/components/Footer";

export default function ConfiguracoesPerfil() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [userRole, setUserRole] = useState(""); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [primarySpecialty, setPrimarySpecialty] = useState<string>("");
  const [categories, setCategories] = useState<{ id: string | number; name: string }[]>([]);

  const [initialData, setInitialData] = useState({ 
    name: "", 
    email: "", 
    bio: "", 
    birthDate: "", 
    interests: [] as string[],
    specialties: [] as string[],
    primarySpecialty: "",
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("access");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [data, categoriesRes] = await Promise.all([
          getMe(token),
          axios.get("http://localhost:8000/api/categories/", {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: [] }))
        ]);

        const fetchedCategories = Array.isArray(categoriesRes.data) 
          ? categoriesRes.data 
          : categoriesRes.data.results || [];

        setCategories(fetchedCategories);

        const formattedName = data.name ? formatName(data.name) : "";
        const userEmail = data.email || "";
        const userBio = data.bio || "";
        const userBirthDate = data.birth_date || "";
        const userInterests = data.interests || [];
        const userSpecialties = data.specialties || [];
        
        const userPrimarySpecialty = data.primary_specialty || data.specialty || (userSpecialties.length > 0 ? userSpecialties[0] : "");

        setName(formattedName);
        setEmail(userEmail);
        setBio(userBio);
        setUserRole(data.role || "");
        setBirthDate(userBirthDate);
        setInterests(userInterests);
        setSpecialties(userSpecialties);
        setPrimarySpecialty(userPrimarySpecialty);

        setInitialData({
          name: formattedName, 
          email: userEmail, 
          bio: userBio, 
          birthDate: userBirthDate, 
          interests: userInterests, 
          specialties: userSpecialties,
          primarySpecialty: userPrimarySpecialty,
        });
      } catch (error) {
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
    birthDate !== initialData.birthDate ||
    JSON.stringify(interests) !== JSON.stringify(initialData.interests) ||
    JSON.stringify(specialties) !== JSON.stringify(initialData.specialties) || 
    primarySpecialty !== initialData.primarySpecialty ||
    password !== "";

  const handleSave = async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }

    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        toast.error("As senhas não coincidem!");
        return;
      }
      if (password.length < 6) {
        toast.error("A senha deve ter ao menos 6 caracteres.");
        return;
      }
    }

    try {
      setIsSaving(true);

      const allSpecialties = primarySpecialty 
        ? Array.from(new Set([primarySpecialty, ...specialties])) 
        : specialties;

      const payload: any = { 
        name, 
        email, 
        bio, 
        birth_date: birthDate || null, 
        interests,
        specialties: allSpecialties, 
      };

      if (password) {
        payload.password = password;
      }

      await updateMe(token, payload);

      setInitialData({ name, email, bio, birthDate, interests, specialties, primarySpecialty });

      setPassword("");
      setConfirmPassword("");
      toast.success("Perfil atualizado com sucesso!");

    } catch (error: any) {
      console.error("Erro ao atualizar o perfil:", error);
      toast.error(error.message || "Erro ao salvar alterações.");
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
        <Footer />
      </div>
    );
  }

  const initials = name
    ? name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const isInstructor = userRole === "professor" || userRole === "instructor";

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      <Toaster position="bottom-right" richColors />

      <Header />

      <Breadcrumb items={[{ label: "Configurações" }]} />

      <main className="flex-1 container max-w-3xl mx-auto px-6 pt-6 pb-12">
        
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#161B1D] tracking-tight text-inter">Configurações</h1>
          <p className="text-gray-500">Gerencie sua conta e preferências.</p>
        </div>

        <div className="space-y-8">
          <ProfileHeader 
            name={name} 
            email={email} 
            initials={initials} 
            role={userRole} 
            birthDate={birthDate} 
          />

          <ProfileDataForm
            name={name} setName={setName}
            email={email} setEmail={setEmail}
            bio={bio} setBio={setBio}
            birthDate={birthDate} setBirthDate={setBirthDate}
          />

          {isInstructor && (
            <SpecialtiesForm
              specialties={specialties}
              setSpecialties={setSpecialties}
              availableCategories={categories}
              primarySpecialty={primarySpecialty}
            />
          )}

          <InterestsForm
            interests={interests}
            setInterests={setInterests}
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
                setBirthDate(initialData.birthDate);
                setInterests(initialData.interests);
                setSpecialties(initialData.specialties);
                setPrimarySpecialty(initialData.primarySpecialty);
                setPassword("");
                setConfirmPassword("");
                toast.info("Alterações descartadas.");
              }}
            >
              Descartar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="bg-[#FF7A00] hover:bg-[#ea7306] text-white font-black px-8 py-6 rounded-xl cursor-pointer flex gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <Save className="h-5 w-5" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}