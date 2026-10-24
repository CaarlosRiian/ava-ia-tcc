import { Button } from "@/components/ui/button";
import { Video as VideoIcon, Trash2, Upload } from "lucide-react";

type Props = {
  videoPreviewName: string | null;
  onVideoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveVideo: () => void;
  disabled?: boolean;
};

export const LessonVideoUpload = ({
  videoPreviewName,
  onVideoChange,
  onRemoveVideo,
  disabled,
}: Props) => {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
        Vídeo da Aula
      </label>
      {videoPreviewName ? (
        <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200 rounded-2xl">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="p-2 bg-orange-50 text-[#FF7A00] rounded-xl shrink-0">
              <VideoIcon className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-gray-800 truncate">
              {videoPreviewName}
            </span>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onRemoveVideo}
            disabled={disabled}
            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs h-8 px-3 rounded-xl shadow-none cursor-pointer shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Remover
          </Button>
        </div>
      ) : (
        <div className="border-2 border border-gray-200 rounded-2xl p-4 text-center hover:border-[#FF7A00]/50 transition-colors bg-gray-50/50">
          <p className="text-xs font-bold text-gray-800">Selecione o arquivo de vídeo</p>
          <p className="text-[10px] text-gray-400 mt-0.5 mb-3">Formatos suportados: MP4, MKV</p>
          <label className="inline-flex">
            <input
              type="file"
              accept="video/mp4,video/mkv"
              onChange={onVideoChange}
              disabled={disabled}
              className="hidden"
            />
            <span className="bg-[#FF7A00] hover:bg-[#ea7306] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm transition-all">
              <Upload className="h-3.5 w-3.5" /> Escolher Vídeo
            </span>
          </label>
        </div>
      )}
    </div>
  );
};