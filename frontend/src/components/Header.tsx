import Link from "next/link";
import { BookOpen, Search, Heart, ChevronDown } from "lucide-react";

export default function Header() {
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
            <button className="flex items-center cursor-pointer gap-1 hover:text-[#2F52E0] transition-colors">
              Explorar <ChevronDown className="h-4 w-4" />
            </button>
            <Link href="/meus-cursos" className="hover:text-[#2F52E0] transition-colors">
              Meus Cursos
            </Link>
          </nav>
        </div>

        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#6366F1] transition-colors" />
            <input
              type="text"
              placeholder="Buscar cursos, aulas..."
              className="w-full bg-[#F3F4F6] border-transparent border-2 focus:border-[#2F52E0] placeholder:text-gray-400 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-400 outline-none transition-all"
            />
          </div> 
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-400 hover:text-red-500 transition-colors hidden xs:block">
            <Heart className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <Link 
              href="/entrar" 
              className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 border border-gray-400 rounded-xl transition-all"
            >
              Entrar
            </Link>
            <Link 
              href="/cadastro" 
              className="px-5 py-2.5 text-sm font-bold bg-[#2F52E0] text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              Cadastrar
            </Link>
          </div>
        </div>

      </div>
    </header>
  );
}