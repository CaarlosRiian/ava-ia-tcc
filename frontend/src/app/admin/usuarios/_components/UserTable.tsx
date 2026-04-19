import { MoreVertical, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Usuario, roleLabels, roleVariants } from "@/data/admType";

interface UserTableProps {
  usuarios: Usuario[];
  onEdit: (u: Usuario) => void;
  onBan: (u: Usuario) => void;
}

export const UserTable = ({ usuarios, onEdit, onBan }: UserTableProps) => {
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
            <TableCell colSpan={5} className="text-center text-muted-foreground py-10">Nenhum usuário encontrado.</TableCell>
          </TableRow>
        ) : (
          usuarios.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={u.avatar} alt={u.nome} />
                    <AvatarFallback>{iniciais(u.nome)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{u.nome}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell><Badge variant={roleVariants[u.role]}>{roleLabels[u.role]}</Badge></TableCell>
              <TableCell>
                <Badge variant={u.status === "ativo" ? "outline" : "destructive"}>
                  {u.status === "ativo" ? "Ativo" : "Banido"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatarData(u.cadastradoEm)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(u)}>Editar papel</DropdownMenuItem>
                    {u.role === "instrutor" && (
                      <DropdownMenuItem asChild>
                        <Link href={`/professor/${u.nome.toLowerCase().replace(/\s+/g, "-")}`}>
                            <ExternalLink className="mr-2 h-4 w-4" /> Ver perfil
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onBan(u)} className={u.status === "ativo" ? "text-destructive" : ""}>
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