"use client";

import { useState, useEffect } from "react";
import { Play, Loader2 } from "lucide-react"; 
import { supabase } from "@/lib/supabaseClient";

interface VideoPlayerProps {
  lesson: any;
  onToggleAI: () => void;
}

export default function VideoPlayer({ lesson, onToggleAI }: VideoPlayerProps) {
  console.log("DADOS DA AULA NO VIDEOPLAYER:", lesson);
  const [playing, setPlaying] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);

  const rawVideoPath = lesson?.video || lesson?.video_url;
  const rawThumbnail = lesson?.thumbnail; 

  const getThumbnailUrl = (thumb?: string | null) => {
    if (!thumb || typeof thumb !== "string" || thumb.trim() === "") return null;
    if (thumb.startsWith("http://") || thumb.startsWith("https://")) {
      return thumb;
    }
    const { data } = supabase.storage
      .from("course-thumbnails") 
      .getPublicUrl(thumb);
    return data.publicUrl;
  };

  const lessonThumbnail = getThumbnailUrl(rawThumbnail);

  useEffect(() => {
    setPlaying(false);
    setVideoSrc(null);
  }, [lesson]);

  const handlePlayClick = async () => {
    if (!rawVideoPath) return;

    if (rawVideoPath.startsWith("http://") || rawVideoPath.startsWith("https://")) {
      setVideoSrc(rawVideoPath);
      setPlaying(true);
      return;
    }

    try {
      setLoadingUrl(true);
      const { data, error } = await supabase.storage
        .from("course-lessons")
        .createSignedUrl(rawVideoPath, 7200);

      if (error) throw error;

      if (data?.signedUrl) {
        setVideoSrc(data.signedUrl);
        setPlaying(true);
      }
    } catch (err) {
      console.error("Erro ao gerar URL assinada para o vídeo:", err);
    } finally {
      setLoadingUrl(false);
    }
  };

  return (
    <div className="bg-black flex items-center justify-center aspect-video w-full relative select-none overflow-hidden border border-gray-800">
      {playing ? (
        videoSrc ? (
          <video
            className="w-full h-full object-contain bg-black"
            controls
            autoPlay
            src={videoSrc}
            controlsList="nodownload"
          >
            Seu navegador não suporta a reprodução de vídeos.
          </video>
        ) : (
          <div className="text-center p-4">
            <p className="text-red-400 text-sm font-semibold">
              Erro ao carregar o link do vídeo.
            </p>
          </div>
        )
      ) : (
        <div
          className="w-full h-full flex flex-col items-center justify-center text-center group cursor-pointer relative"
          onClick={handlePlayClick}
        >
          {lessonThumbnail && (
            <img 
              src={lessonThumbnail} 
              alt={lesson?.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-101 transition-transform duration-500 opacity-70" 
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          )}

          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />

          <div className="bg-[#FF7A00] hover:bg-[#ea7306] rounded-full p-5 mx-auto w-fit mb-3 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(255,122,0,0.4)] z-10 relative flex items-center justify-center">
            {loadingUrl ? (
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            ) : (
              <Play className="h-8 w-8 text-white fill-white" />
            )}
          </div>

          <p className="text-white text-xs font-semibold tracking-widest uppercase z-10 relative drop-shadow-lg">
            {loadingUrl ? "A carregar vídeo..." : "Clique para iniciar a aula"}
          </p>
        </div>
      )}
    </div>
  );
}