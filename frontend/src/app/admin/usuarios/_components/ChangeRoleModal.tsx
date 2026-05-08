"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

import { Select, SelectContent, SelectItem, SelectTrigger,SelectValue, } from "@/components/ui/select";

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
      <DialogContent className="sm:max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">

        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Alterar papel de {user?.username}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Select
            value={role}
            onValueChange={(v) => setRole(v as Role)}
          >
            <SelectTrigger className="w-full h-11 rounded-x border-gray-200 bg-white shadow-sm cursor-pointer">
              <SelectValue placeholder="Selecione um papel" />
            </SelectTrigger>

            <SelectContent className="rounded-xl border border-gray-100 shadow-xl bg-white">
              <SelectItem value="admin" className="rounded-lg cursor-pointer data-[state=checked]:bg-black data-[state=checked]:text-white">
                Admin
              </SelectItem>
              <SelectItem value="professor" className="rounded-lg cursor-pointer data-[state=checked]:bg-black data-[state=checked]:text-white">
                Professor
              </SelectItem>
              <SelectItem value="aluno" className="rounded-lg cursor-pointer data-[state=checked]:bg-black data-[state=checked]:text-white">
                Aluno
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="w-full h-11 rounded-x bg-black hover:bg-gray-800 text-white cursor-pointer"
            onClick={handleSubmit}
          >
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}