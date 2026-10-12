"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Heart, ChevronDown, User, Settings, LogOut, BookMarked, GraduationCap,
  LayoutDashboard, ShieldCheck, Users, } from "lucide-react";

interface HeaderProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Header({ value, onChange }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isAuth, setIsAuth] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [localSearch, setLocalSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access");
    const role = localStorage.getItem("user_role");
    const name = localStorage.getItem("username");
    const email = localStorage.getItem("user_email");

    setIsAuth(!!token);
    setUserRole(role || "");
    setUserName(name || "");
    setUserEmail(email || "");
  }, []);

  const formatName = (name: string) => {
    const cleaned = name.replace(/_/g, " ");

    if (cleaned.length > 15) {
      return cleaned.slice(0, 15) + "...";
    }

    return cleaned;
  };

  const getInitials = (name: string) => {
    return name
      .replace(/_/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user_role");
    localStorage.removeItem("username");
    localStorage.removeItem("user_email");

    window.location.href = "/entrar";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const term = value !== undefined ? value : localSearch;

      if (term.trim()) {
        router.push(`/descobrir?search=${encodeURIComponent(term.trim())}`);
      }
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link
            href="/descobrir"
            className="flex items-center gap-2 font-bold text-xl"
          >
            <img
              src="/ava-ia-icon.png"
              alt="AVA-IA"
              className="h-10 w-10 rounded-lg object-contain"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-[#FF7A00] transition-colors cursor-pointer"
            >
              Explorar <ChevronDown className="h-4 w-4" />
            </Link>
            <Link
              href="/meus-cursos"
              className="hover:text-[#FF7A00] transition-colors"
            >
              Meus Cursos
            </Link>
          </nav>
        </div>
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#FF7A00]" />

            <input
              type="text"
              placeholder="Buscar cursos, aulas..."
              value={value !== undefined ? value : localSearch}
              onChange={
                onChange || ((e) => setLocalSearch(e.target.value))
              }
              onKeyDown={handleKeyDown}
              className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none bg-white border border-gray-400 transition-all duration-500 ease-in-out focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent"
            />

          </div>
        </div>

        <div className="flex items-center gap-4">

          <Link
            href="/favoritos"
            className="flex items-center gap-3 px-3 py-2.5 p-2 text-gray-400 hover:text-red-500 transition-colors duration-300 cursor-pointer"
          >
            <Heart className="h-5 w-5" />
          </Link>

          {isAuth ? (

            <div className="relative group">

              <div className="flex items-center gap-2 cursor-pointer p-1">

                <div className="h-9 w-9 rounded-full bg-[#FF7A00] text-white flex items-center justify-center font-bold shadow-sm">
                  {getInitials(userName)}
                </div>

                <ChevronDown className="h-4 w-4 text-gray-500 transition-transform group-hover:rotate-180" />
              </div>

              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60]">

                <div className="p-4 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-[#FF7A00] text-white flex items-center justify-center text-lg font-bold">
                    {getInitials(userName)}
                  </div>
                  <div className="flex flex-col">

                    <span className="text-[15px] font-bold text-gray-800">
                      {formatName(userName)}
                    </span>

                    <span className="text-xs text-gray-500">
                      {userEmail}
                    </span>

                    <span className="mt-1 w-fit bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {userRole}
                    </span>
                  </div>
                </div>

                <div className="h-[1px] bg-gray-50 w-full" />

                <div className="p-2">

                  <span className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Conta
                  </span>

                  <div className="mt-1 space-y-0.5 text-[14px] text-gray-700 font-medium">

                    {userRole === "professor" && (
                      <Link
                        href={`/professor/${userName.toLowerCase()}`}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <User className="h-5 w-5 text-gray-500" />
                        Meu perfil
                      </Link>
                    )}

                    <Link
                      href="/meus-cursos"
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <BookMarked className="h-5 w-5 text-gray-500" />
                      Meus cursos
                    </Link>

                    <Link
                      href="/configuracoes"
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <Settings className="h-5 w-5 text-gray-500" />
                      Configurações
                    </Link>

                  </div>
                </div>

                <div className="h-[1px] bg-gray-50 w-full" />

                <div className="p-2">

                  <span className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Áreas
                  </span>

                  <div className="mt-1 space-y-0.5 text-[14px] text-gray-700 font-medium">

                    {userRole === "aluno" && (
                      <Link
                        href="/instrutor/cadastro"
                        className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <GraduationCap className="h-5 w-5 text-gray-500" />
                        Quero ser instrutor
                      </Link>
                    )}

                    {userRole === "professor" && (
                      <Link
                        href="/instrutor/gerenciar"
                        className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <LayoutDashboard className="h-5 w-5 text-gray-500" />
                        Painel do professor
                      </Link>
                    )}

                    {userRole === "admin" && (
                      <>
                        <Link
                          href="/admin/solicitacoes"
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <ShieldCheck className="h-5 w-5 text-gray-500" />
                          Painel do admin
                        </Link>

                        <Link
                          href="/admin/usuarios"
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <Users className="h-5 w-5 text-gray-500" />
                          Gerenciar usuários
                        </Link>

                        <Link
                          href="/admin/categorias"
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <ShieldCheck className="h-5 w-5 text-gray-500" />
                          Categorias
                        </Link>
                      </>
                    )}

                  </div>
                </div>

                <div className="h-[1px] bg-gray-50 w-full" />

                <div className="p-2">

                  <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-3 py-3 text-red-500 font-bold text-[14px] hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="h-5 w-5" />
                    Sair
                  </button>

                </div>

              </div>
            </div>

          ) : (

            <div className="flex items-center gap-2">

              <Link
                href="/entrar"
                className="px-5 py-2.5 text-sm font-bold text-gray-600 border border-gray-400 rounded-xl"
              >
                Entrar
              </Link>

              <Link
                href="/cadastro"
                className="px-5 py-2.5 text-sm font-bold bg-[#FF7A00] text-white rounded-xl"
              >
                Cadastrar
              </Link>

            </div>
          )}

        </div>
      </div>
    </header>
  );
}