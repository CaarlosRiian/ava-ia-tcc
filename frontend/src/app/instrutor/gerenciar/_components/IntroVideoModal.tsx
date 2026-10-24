"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud, Video, Trash2, Loader2 } from "lucide-react";
import { uploadMedia } from "@/lib/uploadMedia";
import { supabase } from "@/lib/supabaseClient";

type DeleteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoName?: string;
  onConfirm: () => Promise<void>;
  loading: boolean;
};

function DeleteIntroModal({ open, onOpenChange, onConfirm, loading }: DeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl bg-white p-6 shadow-xl border-none">
        <DialogHeader className="space-y-2 pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-black text-gray-900">
            Excluir Vídeo de Introdução
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Tem certeza que deseja remover este vídeo? Esta ação apagará o ficheiro permanentemente do armazenamento.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4 border-t border-gray-100 flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-gray-200 text-gray-700 hover:bg-gray-50 h-11 px-5 rounded-xl text-xs font-bold cursor-pointer shadow-sm"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs h-11 px-6 rounded-xl shadow-none transition-all cursor-pointer flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin text-red-600" />}
            {loading ? "Excluindo..." : "Sim, excluir vídeo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string | number;
  currentVideoUrl?: string | null;
  onSave: (videoPath: string | null) => Promise<void>;
  onShowToast: (msg: string, type?: "success" | "error") => void;
};

export function IntroVideoModal({
  open,
  onOpenChange,
  courseId,
  currentVideoUrl,
  onSave,
  onShowToast,
}: Props) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [signedVideoUrl, setSignedVideoUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchSignedUrl() {
      if (!open || !currentVideoUrl) {
        setSignedVideoUrl(null);
        return;
      }

      try {
        setLoadingPreview(true);
        const { data, error } = await supabase.storage
          .from("course-lessons")
          .createSignedUrl(currentVideoUrl, 3600);

        if (error) throw error;
        if (isMounted && data?.signedUrl) {
          setSignedVideoUrl(data.signedUrl);
        }
      } catch (err) {
        console.error("Erro ao gerar URL de preview:", err);
      } finally {
        if (isMounted) setLoadingPreview(false);
      }
    }

    fetchSignedUrl();

    return () => {
      isMounted = false;
    };
  }, [open, currentVideoUrl]);

  const handleUploadAndSave = async () => {
    if (!videoFile) {
      onShowToast("Selecione um ficheiro de vídeo primeiro.", "error");
      return;
    }

    try {
      setLoading(true);
      setUploadStatus("Enviando vídeo para o Supabase Storage...");

      if (currentVideoUrl) {
        await supabase.storage.from("course-lessons").remove([currentVideoUrl]);
      }

      const uploadResult = await uploadMedia({
        bucket: "course-lessons",
        file: videoFile,
        folder: `courses/${courseId}/intro`,
      });

      setUploadStatus("Atualizando dados do curso...");
      await onSave(uploadResult.path);

      onShowToast("Aula introdutória atualizada com sucesso!");
      setVideoFile(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro no upload da aula introdutória:", error);
      onShowToast("Erro ao enviar o vídeo. Tente novamente.", "error");
    } finally {
      setLoading(false);
      setUploadStatus("");
    }
  };

  const handleDelete = async () => {
    if (!currentVideoUrl) return;

    try {
      setDeleteLoading(true);

      const { error } = await supabase.storage
        .from("course-lessons")
        .remove([currentVideoUrl]);

      if (error) throw error;

      await onSave(null);

      onShowToast("Vídeo de introdução removido com sucesso!");
      setVideoFile(null);
      setDeleteOpen(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao apagar o vídeo:", error);
      onShowToast("Erro ao remover o vídeo. Tente novamente.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-white sm:max-w-lg rounded-3xl p-6 shadow-xl border-none">
          <DialogHeader className="pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-50 text-[#FF7A00] rounded-2xl">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-gray-900">
                  Aula Introdutória do Curso
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 mt-0.5">
                  Visualize, substitua ou remova o vídeo de apresentação do curso.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {currentVideoUrl ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-700 uppercase tracking-wider">Vídeo Atual</span>
                  <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg">Ativo</span>
                </div>

                <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-gray-100 shadow-inner flex items-center justify-center">
                  {loadingPreview ? (
                    <div className="flex items-center gap-2 text-xs text-white">
                      <Loader2 className="w-4 h-4 animate-spin text-[#FF7A00]" />
                      Carregando preview...
                    </div>
                  ) : signedVideoUrl ? (
                    <video
                      src={signedVideoUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">Erro ao carregar preview</span>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={loading}
                    onClick={() => setDeleteOpen(true)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs h-9 px-3 rounded-xl shadow-none transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Excluir este vídeo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 text-xs text-orange-800 font-medium text-center">
                Nenhum vídeo de introdução configurado atualmente.
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-[#FF7A00]" />
                {currentVideoUrl ? "Substituir por Novo Vídeo" : "Selecionar Vídeo"} (.mp4, .mkv)
              </label>
              <input
                type="file"
                accept="video/mp4,video/mkv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setVideoFile(e.target.files[0]);
                  }
                }}
                className="w-full text-xs text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-[#FF7A00] hover:file:bg-orange-100 cursor-pointer border border-gray-200 rounded-2xl p-2 bg-gray-50/50"
              />
              {videoFile && (
                <p className="text-xs text-emerald-600 font-medium pl-1 truncate">
                  Novo ficheiro selecionado: {videoFile.name}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-100 flex items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => {
                setVideoFile(null);
                onOpenChange(false);
              }}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 h-11 px-5 rounded-xl text-xs font-bold cursor-pointer shadow-sm"
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={handleUploadAndSave}
              disabled={loading || !videoFile}
            className="bg-[#FF7A00] hover:bg-[#ea7306] text-white h-11 px-6 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? uploadStatus || "Salvando..." : currentVideoUrl ? "Substituir Vídeo" : "Salvar Vídeo"}
            </Button>
          </DialogFooter>
        </DialogContent>

        <DeleteIntroModal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      </Dialog>
    </>
  );
}