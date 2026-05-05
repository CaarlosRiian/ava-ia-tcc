"use client";

import { FormEvent, useState } from "react";
import { Mail, LockKeyhole, ChevronRight } from "lucide-react";
import { loginUser, saveTokens, getMe } from "@/services/auth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser({ email, password });

      saveTokens(data.access, data.refresh);

      const me = await getMe(data.access);

      localStorage.setItem("username", me.name || me.username);
      localStorage.setItem("user_email", me.email);
      localStorage.setItem("user_role", me.role);

      window.location.href = "/descobrir";

    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6 text-left">

      <div className="max-w-[410px] mx-auto w-full">
        <label className="block text-sm font-bold text-[#364153] mb-1 ml-1">
          E-mail
        </label>

        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Mail size={18} />
          </span>

          <input type="email" placeholder="user@email.com" value={email}
            onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-3 py-3 border rounded-lg" />
        </div>
      </div>

      <div className="max-w-[410px] mx-auto w-full">
        <label className="block text-sm font-bold text-[#364153] mb-1 ml-1">
          Senha
        </label>

        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <LockKeyhole size={18} />
          </span>

          <input type="password" placeholder="••••••••••••" value={password}
            onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-3 py-3 border rounded-lg"/>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-bold max-w-[410px] mx-auto">
          {error}
        </p>
      )}

      <div className="max-w-[410px] mx-auto">
        <button type="submit" disabled={loading} className="w-full py-3 bg-[#2F52E0] text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer" >
          {loading ? "Entrando..." : "Entrar"}
          {!loading && <ChevronRight size={18} />}
        </button>
      </div>
    </form>
  );
}