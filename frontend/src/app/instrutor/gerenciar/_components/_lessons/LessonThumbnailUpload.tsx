import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Trash2, Upload } from "lucide-react";

type Props = {
  mode: "create" | "edit";
  thumbPreview: string | null;
  onThumbChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveThumb: () => void;
  disabled?: boolean;
};

export const LessonThumbnailUpload = ({
  mode,
  thumbPreview,
  onThumbChange,
  onRemoveThumb,
  disabled,
}: Props) => {
  return (
    <div className="space-y-1.5 pt-1">
      <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
        {mode === "create" ? "Capa do Vídeo" : "Alterar Capa (Opcional)"}
      </label>

      {thumbPreview ? (
        <div className="relative group rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 p-2 shadow-sm">
          <img
            src={thumbPreview}
            alt="Capa do vídeo"
            className="w-full h-40 object-cover rounded-xl"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-2xl">
            <label className="cursor-pointer bg-white text-gray-900 font-bold text-xs px-3.5 py-2 rounded-xl shadow-md hover:bg-gray-100 transition">
              Trocar Imagem
              <input
                type="file"
                accept="image/*"
                onChange={onThumbChange}
                disabled={disabled}
                className="hidden"
              />
            </label>
            <Button
              type="button"
              variant="destructive"
              onClick={onRemoveThumb}
              disabled={disabled}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-md cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Remover
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-2 border border-gray-200 rounded-2xl p-4 text-center hover:border-[#FF7A00]/50 transition-colors bg-gray-50/50">
          <div className="p-2.5 bg-white shadow-sm rounded-xl w-fit mx-auto mb-1.5 text-[#FF7A00]">
            <ImageIcon className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-gray-800">Carregar imagem de capa</p>
          <p className="text-[10px] text-gray-400 mt-0.5 mb-3">Recomendado: 1280x720px (PNG, JPG)</p>
          <label className="inline-flex">
            <input
              type="file"
              accept="image/*"
              onChange={onThumbChange}
              disabled={disabled}
              className="hidden"
            />
            <span className="bg-[#FF7A00] hover:bg-[#ea7306] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm transition-all">
              <Upload className="h-3.5 w-3.5" /> Escolher Ficheiro
            </span>
          </label>
        </div>
      )}
    </div>
  );
};