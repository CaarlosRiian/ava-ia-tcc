import { Upload } from "lucide-react";
import { Label } from "@/components/ui/label";

interface FileUploadProps {
  arquivo: File | null;
  setArquivo: (file: File | null) => void;
}

export function FileUpload({ arquivo, setArquivo }: FileUploadProps) {
  return (
    <div className="space-y-2">
      <Label>Documento / Certificado (Opcional)</Label>
      <div
        className="border-2 border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#2F52E0]/50 hover:bg-[#2F52E0]/5 transition-all group"
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3 group-hover:text-[#2F52E0] transition-colors" />
        {arquivo ? (
          <div className="space-y-1">
            <p className="text-sm font-bold text-[#161B1D]">{arquivo.name}</p>
            <p className="text-xs text-gray-400">Clique para trocar o arquivo</p>
          </div>
        ) : (
          <>
            <p className="text-sm font-bold text-[#161B1D]">Clique para enviar</p>
            <p className="text-xs text-gray-400">PDF, JPG ou PNG (máx. 5MB)</p>
          </>
        )}
      </div>
      <input
        id="file-upload"
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => setArquivo(e.target.files?.[0] || null)}
      />
    </div>
  );
}