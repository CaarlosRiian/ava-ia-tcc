import { MoreVertical, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Usuario, roleLabels, roleVariants } from "@/data/admType";
import { formatName } from "@/utils/formatName";

interface UserTableProps {
  usuarios: Usuario[];
  onEdit: (u: Usuario) => void;
  onBan: (u: Usuario) => void;
  onOpenRole: (user: Usuario) => void;
}

export const UserTable = ({ usuarios, onEdit, onBan, onOpenRole }: UserTableProps) => {
  const formatarData = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  const iniciais = (nome: string) => nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Usuário</TableHead>
          <TableHead>Papel</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Cadastrado em</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usuarios.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-bold py-10">
              Nenhum usuário encontrado.
            </TableCell>
          </TableRow>
        ) : (
          usuarios.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={u.avatar_url} alt={u.username} />
                    <AvatarFallback>{iniciais(u.username)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{formatName(u.username)}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Badge variant={roleVariants[u.role]}>{roleLabels[u.role]}</Badge>
              </TableCell>

              <TableCell>
                <Badge variant={u.status === "ativo" ? "outline" : "destructive"}>
                  {u.status === "ativo" ? "Ativo" : "Banido"}
                </Badge>
              </TableCell>

              <TableCell className="text-muted-foreground">
                {formatarData(u.created_at)}
              </TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger className="p-2 hover:bg-gray-100 rounded-full cursor-pointer outline-none transition-colors">
                    <MoreVertical className="h-4 w-4 text-gray-600" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-48 bg-white shadow-lg border border-gray-100 rounded-xl p-1">
                    <DropdownMenuItem
                      onClick={() => onOpenRole(u)}
                      className="cursor-pointer flex items-center px-3 py-2 text-sm rounded-lg hover:bg-gray-50 focus:bg-gray-50 outline-none"
                    >
                      Editar papel
                    </DropdownMenuItem>

                    {u.role === "professor" && (
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/professor/${u.username.toLowerCase().replace(/\s+/g, "-")}`}
                          className="cursor-pointer flex items-center px-3 py-2 text-sm rounded-lg hover:bg-gray-50 focus:bg-gray-50 outline-none"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Ver perfil
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator className="my-1 bg-gray-100" />

                    <DropdownMenuItem
                      onClick={() => onBan(u)}
                      className={`cursor-pointer flex items-center px-3 py-2 text-sm rounded-lg outline-none focus:bg-red-50 ${u.status === "ativo" ? "text-red-600 focus:text-red-600" : "text-green-600 focus:text-green-600"
                        }`}
                    >
                      {u.status === "ativo" ? "Banir usuário" : "Reativar usuário"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};