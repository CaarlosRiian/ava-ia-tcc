import { MoreVertical, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Usuario, roleLabels, roleVariants } from "@/data/admType";
import { formatName } from "@/utils/formatName";

interface UserTableProps {
  usuarios: Usuario[];
  idUsuarioLogado: number | null; 
  onEdit: (u: Usuario) => void;
  onBan: (u: Usuario) => void;
  onOpenRole: (user: Usuario) => void;
}

export const UserTable = ({ usuarios, idUsuarioLogado, onEdit, onBan, onOpenRole }: UserTableProps) => {
  const formatarData = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  const iniciais = (nome: string) => nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <Table className="bg-white rounded-xl">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="font-bold text-gray-700">Usuário</TableHead>
          <TableHead className="font-bold text-gray-700">Papel</TableHead>
          <TableHead className="font-bold text-gray-700">Status</TableHead>
          <TableHead className="font-bold text-gray-700">Cadastrado em</TableHead>
          <TableHead className="text-right font-bold text-gray-700">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usuarios.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center font-medium py-10 text-gray-500">
              Nenhum usuário encontrado.
            </TableCell>
          </TableRow>
        ) : (
          usuarios.map((u) => (
            <TableRow key={u.id} className="hover:bg-gray-50/50 transition-colors">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-gray-100">
                    <AvatarImage src={u.avatar_url} alt={u.username} />
                    <AvatarFallback className="bg-gray-100 text-gray-700 text-xs font-bold">
                      {iniciais(u.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{formatName(u.username)}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Badge variant={roleVariants[u.role]} className="font-medium">
                  {roleLabels[u.role]}
                </Badge>
              </TableCell>

              <TableCell>
                <Badge variant={u.status === "ativo" ? "outline" : "destructive"} className="font-medium">
                  {u.status === "ativo" ? "Ativo" : "Banido"}
                </Badge>
              </TableCell>

              <TableCell className="text-sm text-gray-500">
                {formatarData(u.created_at)}
              </TableCell>

              <TableCell className="text-right">
                {idUsuarioLogado && u.id === idUsuarioLogado ? (
                  <span className="text-xs font-bold bg-indigo-50 text-[#6366F1] py-1 px-2.5 rounded-lg border border-indigo-100 select-none inline-block align-middle">
                    Você
                  </span>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 hover:bg-gray-100 rounded-full cursor-pointer outline-none transition-colors inline-flex items-center justify-center">
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-48 bg-white shadow-xl border border-gray-200 rounded-xl p-1 z-50">
                      <DropdownMenuItem
                        onClick={() => onOpenRole(u)}
                        className="cursor-pointer flex items-center px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-50 focus:bg-gray-50 outline-none transition-colors"
                      >
                        Editar papel
                      </DropdownMenuItem>

                      {u.role === "professor" && (
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/professor/${u.username.toLowerCase().replace(/\s+/g, "-")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cursor-pointer flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-50 focus:bg-gray-50 outline-none transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                            Ver perfil
                          </Link>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator className="my-1 bg-gray-100" />

                      <DropdownMenuItem
                        onClick={() => onBan(u)}
                        className={`cursor-pointer flex items-center px-3 py-2 text-sm rounded-lg outline-none transition-colors ${
                          u.status === "ativo" 
                            ? "text-red-600 focus:bg-red-50 focus:text-red-600" 
                            : "text-green-600 focus:bg-green-50 focus:text-green-600"
                        }`}
                      >
                        {u.status === "ativo" ? "Banir usuário" : "Reativar usuário"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};