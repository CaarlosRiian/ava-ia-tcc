import { User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProfileDataFormProps {
    name: string;
    setName: (value: string) => void;
    email: string;
    setEmail: (value: string) => void;
    bio: string;
    setBio: (value: string) => void;
}

export function ProfileDataForm({
    name,
    setName,
    email,
    setEmail,
    bio,
    setBio,
}: ProfileDataFormProps) {
    return (
        <Card className="border-none bg-white shadow-sm rounded-[16px]">
            <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <User className="h-5 w-5 text-[#2F52E0]" /> Dados do Perfil
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4">
                    <Label className="font-bold text-gray-700">Nome completo</Label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome"
                    />
                </div>
                <div className="grid gap-4">
                    <Label className="font-bold text-gray-700">E-mail</Label>
                    <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-md p-4"
                        placeholder="seu.email@exemplo.com"
                    />
                </div>
                <div className="grid gap-4">
                    <Label className="font-bold text-gray-700">Biografia</Label>
                    <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="rounded-md p-3 resize-none"
                        placeholder="Conte um pouco sobre você..."
                    />
                </div>
            </CardContent>
        </Card>
    );
}