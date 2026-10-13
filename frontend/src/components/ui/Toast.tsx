"use client";

import { CheckCircle2, AlertCircle, X } from "lucide-react";

interface ToastProps {
  message: string | null;
  type?: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type = "success", onClose }: ToastProps) {
  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-xl animate-bounce-short">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSuccess ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>
        {isSuccess ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      </div>
      <div className="flex flex-col pr-2">
        <span className="font-bold text-xs text-gray-800">{isSuccess ? "Sucesso!" : "Atenção"}</span>
        <span className="text-xs text-gray-500">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  );
}