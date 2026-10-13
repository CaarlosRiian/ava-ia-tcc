"use client";

import { AlertTriangle } from "lucide-react";

interface DeleteModalProps {
  isOpen: boolean;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({ isOpen, deleting, onClose, onConfirm }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto">
          <AlertTriangle size={24} />
        </div>

        <div className="space-y-1">
          <h4 className="font-bold text-gray-800 text-base">Excluir comentário?</h4>
          <p className="text-xs text-gray-500">
            Esta ação não pode ser desfeita. O comentário será removido permanentemente.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="w-1/2 py-2.5 px-4 bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-200 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="w-1/2 py-2.5 px-4 bg-red-500 text-white font-semibold text-xs rounded-xl hover:bg-red-600 transition shadow-md cursor-pointer disabled:opacity-50"
          >
            {deleting ? "Excluindo..." : "Sim, excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}