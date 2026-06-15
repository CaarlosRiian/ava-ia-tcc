"use client";

import { useState } from "react";
import { Play, Sparkles } from "lucide-react";

interface VideoPlayerProps {
  lesson: any;
  onToggleAI: () => void;
}

export default function VideoPlayer({ lesson, onToggleAI }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);

  const videoUrl = lesson?.video;
  const lessonThumbnail = lesson?.thumbnail; 

  return (
    <div className="bg-black flex items-center justify-center aspect-video w-full shadow-2xl relative select-none overflow-hidden rounded-2xl border border-gray-800">
      
      {playing ? (
        videoUrl ? (
          <video
            className="w-full h-full object-contain bg-black"
            controls
            autoPlay
            src={videoUrl}
            controlsList="nodownload"
          >
            Seu navegador não suporta a reprodução de vídeos.
          </video>
        ) : (
          <div className="text-center p-4">
            <p className="text-red-400 text-sm font-semibold">
              Arquivo de vídeo não encontrado.
            </p>
          </div>
        )
      ) : (
        <div
          className="w-full h-full flex flex-col items-center justify-center text-center group cursor-pointer relative"
          onClick={() => setPlaying(true)}
        >
          {lessonThumbnail && (
            <img 
              src={lessonThumbnail} 
              alt={lesson?.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-101 transition-transform duration-500 opacity-70" 
            />
          )}

          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />

          <div className="bg-[#2F52E0] rounded-full p-5 mx-auto w-fit mb-3 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(47,82,224,0.4)] z-10 relative">
            <Play className="h-8 w-8 text-white fill-white" />
          </div>

          <p className="text-white text-xs font-semibold tracking-widest uppercase z-10 relative drop-shadow-lg">
            Clique para iniciar a aula
          </p>
        </div>
      )}

      <button
        onClick={onToggleAI}
        className="absolute top-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-xl text-xs flex items-center gap-2 hover:bg-black/60 transition-all z-20 cursor-pointer active:scale-95 shadow-md"
      >
        <Sparkles className="h-3 w-3 text-purple-400 animate-pulse" />
        Dúvidas nesta parte?
      </button>
    </div>
  );
}