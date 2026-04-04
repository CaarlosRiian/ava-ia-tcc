"use client"; 

import { Mail, LockKeyhole, Eye, ChevronRight } from 'lucide-react';

export default function LoginForm() {
  return (
    <form className="mt-8 space-y-6 text-left">
      <div className="max-w-[410px] mx-auto w-full">
        <label className="block text-sm font-medium text-[#364153] mb-1 ml-1">E-mail</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Mail size={18} strokeWidth={1.5} />
          </span>
          <input
            type="email"
            placeholder="user@email.com"
            className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2F52E0] outline-none text-gray-700 font-light text-sm transition-all placeholder:text-gray-300 shadow-sm"
          />
        </div>
      </div>

      <div className="max-w-[410px] mx-auto w-full">
        <label className="block text-sm font-medium text-[#364153] mb-1 ml-1">Senha</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <LockKeyhole size={18} strokeWidth={1.5} />
          </span>
          <input
            type="password"
            placeholder="••••••••••••"
            className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2F52E0] outline-none text-gray-700 font-light text-sm transition-all placeholder:text-gray-300 shadow-sm"
          />
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-[#2F52E0] transition-colors">
            <Eye size={18} strokeWidth={1.5} />
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm max-w-[410px] mx-auto px-1">
        <label className="flex items-center text-[#364153] cursor-pointer font-light">
          <input type="checkbox" className="mr-2 cursor-pointer rounded border-gray-300 accent-[#2F52E0]" />
          Lembrar de Mim
        </label>
        <a href="#" className="text-[#364153] hover:underline font-medium">
          Esqueci a senha?
        </a>
      </div>

      <div className="max-w-[410px] mx-auto">
        <button
          type="submit"
          className="w-full py-3 bg-[#2F52E0] text-white font-semibold rounded-lg hover:bg-blue-700 cursor-pointer  flex items-center justify-center gap-2 "
        >
          Entrar
          <ChevronRight size={18} />
        </button>
      </div>
    </form>
  );
}