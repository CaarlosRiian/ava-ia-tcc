"use client";

import { User, Mail, LockKeyhole, Eye, UserPlus } from 'lucide-react';

export default function RegisterForm() {
  return (
    <form className="mt-8 space-y-5 text-left">
      <div className="max-w-[410px] mx-auto w-full">
        <label className="block text-sm font-bold text-[#364153] mb-1 ml-1">Nome completo</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <User size={18} strokeWidth={1.5} />
          </span>
          <input
            type="text"
            placeholder="Ex: John Kenndy Doe"
            className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2F52E0] outline-none text-gray-700 font-light text-sm transition-all placeholder:text-gray-300 shadow-sm"
          />
        </div>
      </div>

      <div className="max-w-[410px] mx-auto w-full">
        <label className="block text-sm font-bold text-[#364153] mb-1 ml-1">E-mail</label>
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
        <label className="block text-sm font-bold text-[#364153] mb-1 ml-1">Senha</label>
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

      <div className="max-w-[410px] mx-auto w-full">
        <label className="block text-sm font-bold text-[#364153] mb-1 ml-1">Repetir Senha</label>
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

      <div className="max-w-[410px] mx-auto pt-2">
        <button
          type="submit"
          className="w-full py-3 bg-[#2F52E0] text-white font-semibold rounded-lg hover:bg-blue-700 cursor-pointer  flex items-center justify-center gap-2 "
        >
          Cadastrar-se
          <UserPlus size={18} />
        </button>
      </div>
    </form>
  );
}