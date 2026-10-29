"use client";

import { useState, useEffect } from "react";
import { Shield, UserCheck, GraduationCap } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { Usuario, Role } from "@/data/admType";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Usuario | null;
  onConfirm: (
    user: Usuario,
    role: Role
  ) => void;
}

export function ChangeRoleModal({
  open,
  onOpenChange,
  user,
  onConfirm,
}: Props) {
  const [role, setRole] = useState<Role>("aluno");

  useEffect(() => {
    if (user) {
      setRole(user.role);
    }
  }, [user]);

  function handleSubmit() {
    if (!user) return;

    onConfirm(user, role);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-4">
        
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-bold tracking-tight text-gray-900">
            Alterar Nível de Acesso
          </DialogTitle>
          <p className="text-xs text-gray-500 font-medium">
            Modifique as permissões de acesso para <strong className="text-gray-800">{user?.username}</strong> no sistema.
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Novo Papel
            </label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as Role)}
            >
              <SelectTrigger className="w-full h-12 rounded-x border-gray-200 bg-white hover:bg-gray-50 transition shadow-none cursor-pointer font-medium text-gray-800 focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Selecione um papel" />
              </SelectTrigger>

              <SelectContent className="rounded-2xl border border-gray-100 shadow-xl bg-white p-1">
                <SelectItem 
                  value="admin" 
                  className="rounded-xl py-2.5 px-3 cursor-pointer focus:bg-orange-50 focus:text-gray-900 data-[state=checked]:bg-orange-50 data-[state=checked]:text-[#FF7A00] font-medium flex items-center gap-2"
                >
                  <span className="flex items-center gap-2">
                    <Shield size={15} className="text-[#FF7A00]" /> Admin
                  </span>
                </SelectItem>
                <SelectItem 
                  value="professor" 
                  className="rounded-xl py-2.5 px-3 cursor-pointer focus:bg-orange-50 focus:text-gray-900 data-[state=checked]:bg-orange-50 data-[state=checked]:text-[#FF7A00] font-medium flex items-center gap-2"
                >
                  <span className="flex items-center gap-2">
                    <UserCheck size={15} className="text-[#FF7A00]" /> Professor
                  </span>
                </SelectItem>
                <SelectItem 
                  value="aluno" 
                  className="rounded-xl py-2.5 px-3 cursor-pointer focus:bg-orange-50 focus:text-gray-900 data-[state=checked]:bg-orange-50 data-[state=checked]:text-[#FF7A00] font-medium flex items-center gap-2"
                >
                  <span className="flex items-center gap-2">
                    <GraduationCap size={15} className="text-[#FF7A00]" /> Aluno
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12 rounded-xl border-gray-200 hover:bg-gray-50 font-bold text-gray-700 cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button
              className="flex-1 h-12 rounded-xl bg-[#FF7A00] hover:bg-[#ea7306] text-white font-bold shadow-sm shadow-orange-500/20 transition cursor-pointer"
              onClick={handleSubmit}
            >
              Salvar Alterações
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}