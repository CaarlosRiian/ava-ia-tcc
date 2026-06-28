"use client";

import { useState } from "react";
import { User, Mail, LockKeyhole, UserPlus, Eye, EyeOff } from "lucide-react";
import { registerUser, loginUser, saveTokens, getMe } from "@/services/auth"; 

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        username: username.replace(/\s/g, "_"),
        email,
        password,
      });

      const tokenData = await loginUser({ email, password });

      saveTokens(tokenData.access, tokenData.refresh);

      const me = await getMe(tokenData.access);
      localStorage.setItem("username", me.name || me.username);
      localStorage.setItem("user_email", me.email);
      localStorage.setItem("user_role", me.role);

      window.location.href = "/descobrir";

    } catch (err: any) {
      setError(err.message || "Erro ao criar conta ou fazer login automático");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5 text-left">

      <div className="max-w-[410px] mx-auto w-full">
        <label className="block text-sm font-bold text-[#364153] mb-1 ml-1">
          Nome completo
        </label>

        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <User size={18} />
          </span>

          <input 
            type="text" 
            placeholder="Ex: John Kennedy Doe" 
            value={username}
            onChange={(e) => setUsername(e.target.value)} 
            className="w-full pl-10 pr-3 py-3 border rounded-lg" 
          />
        </div>
      </div>

      <div className="max-w-[410px] mx-auto w-full">
        <label className="block text-sm font-bold text-[#364153] mb-1 ml-1">
          E-mail
        </label>

        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Mail size={18} />
          </span>

          <input
            type="email" 
            placeholder="user@email.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full pl-10 pr-3 py-3 border rounded-lg" 
          />
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

          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="••••••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full pl-10 pr-12 py-3 border rounded-lg" 
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="max-w-[410px] mx-auto w-full">
        <label className="block text-sm font-bold text-[#364153] mb-1 ml-1">
          Repetir Senha
        </label>

        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <LockKeyhole size={18} />
          </span>

          <input 
            type={showConfirmPassword ? "text" : "password"} 
            placeholder="••••••••••••" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            className="w-full pl-10 pr-12 py-3 border rounded-lg" 
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm max-w-[410px] mx-auto">
          {error}
        </p>
      )}

      <div className="max-w-[410px] mx-auto pt-2">
        <button type="submit" disabled={loading} className="w-full py-3 bg-[#2F52E0] text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer" >
          {loading ? "Criando e entrando..." : "Cadastrar-se"}
          {!loading && <UserPlus size={18} />}
        </button>
      </div>
    </form>
  );
}