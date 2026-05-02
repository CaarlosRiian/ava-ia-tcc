"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Search, Heart, ChevronDown, User, Settings, LogOut, BookMarked,
  GraduationCap, LayoutDashboard, ShieldCheck, } from "lucide-react";

export default function Header() {
  const [isAuth, setIsAuth] = useState(false);
  const [userRole, setUserRole] = useState("aluno"); 

  useEffect(() => {
    const token = localStorage.getItem("access");
    const role = localStorage.getItem("user_role"); 
    setIsAuth(!!token);
    if (role) setUserRole(role);
  }, []);

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user_role");
    window.location.href = "/entrar";
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-[#6366F1] rounded-lg p-1.5 text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-[#161B1D]">
              AVA-<span className="text-[#6366F1]">IA</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
            <button className="flex items-center gap-1 hover:text-[#2F52E0] transition-colors cursor-pointer">
              Explorar <ChevronDown className="h-4 w-4" />
            </button>
            <Link href="/meus-cursos" className="hover:text-[#2F52E0] transition-colors">
              Meus Cursos
            </Link>
          </nav>
        </div>

        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#6366F1]" />
            <input
              type="text"
              placeholder="Buscar cursos, aulas..."
              className="w-full bg-[#F3F4F6] rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer" title="Meus Favoritos">
            <Heart className="h-5 w-5" />
          </button>

          {isAuth ? (
            <div className="relative group">
              <div className="flex items-center gap-2 cursor-pointer p-1">
                <div className="h-9 w-9 rounded-full bg-[#6366F1] text-white flex items-center justify-center font-bold shadow-sm">
                  RC
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 transition-transform group-hover:rotate-180" />
              </div>

              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60]">
                
                <div className="p-4 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-[#6366F1] text-white flex items-center justify-center text-lg font-bold">
                    RC
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold text-gray-800">Rian Carlos</span>
                    <span className="text-xs text-gray-500">rian.carlos@email.com</span>
                    <span className="mt-1 w-fit bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {userRole}
                    </span>
                  </div>
                </div>

                <div className="h-[1px] bg-gray-50 w-full" />

                <div className="p-2">
                  <span className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Conta</span>
                  <div className="mt-1 space-y-0.5 text-[14px] text-gray-700 font-medium">
                    <Link href="/perfil" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors">
                      <User className="h-5 w-5 text-gray-500" /> Meu perfil
                    </Link>
                    <Link href="/meus-cursos" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors">
                      <BookMarked className="h-5 w-5 text-gray-500" /> Meus cursos
                    </Link>
                    <Link href="/configuracoes" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors">
                      <Settings className="h-5 w-5 text-gray-500" /> Configurações
                    </Link>
                  </div>
                </div>

                <div className="h-[1px] bg-gray-50 w-full" />

                <div className="p-2">
                  <span className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Áreas</span>
                  <div className="mt-1 space-y-0.5 text-[14px] text-gray-700 font-medium">
                    
                    {userRole === 'aluno' && (
                      <button className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-left cursor-pointer">
                        <GraduationCap className="h-5 w-5 text-gray-500" /> Quero ser instrutor
                      </button>
                    )}

                    {userRole === 'professor' && (
                      <button className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-left cursor-pointer">
                        <LayoutDashboard className="h-5 w-5 text-gray-500" /> Painel do professor
                      </button>
                    )}

                    {userRole === 'admin' && (
                      <button className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-left cursor-pointer">
                        <ShieldCheck className="h-5 w-5 text-gray-500" /> Painel admin
                      </button>
                    )}
                  </div>
                </div>

                <div className="h-[1px] bg-gray-50 w-full" />

                <div className="p-2">
                  <button onClick={logout}
                    className="flex items-center gap-3 w-full px-3 py-3 text-red-500 font-bold text-[14px] hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="h-5 w-5" /> Sair
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/entrar" className="px-5 py-2.5 text-sm font-bold text-gray-600 border border-gray-400 rounded-xl">
                Entrar
              </Link>
              <Link href="/cadastro" className="px-5 py-2.5 text-sm font-bold bg-[#2F52E0] text-white rounded-xl">
                Cadastrar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}