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
    <div className="bg-black flex items-center justify-center aspect-video max-h-[60vh] w-full shadow-2xl relative select-none overflow-hidden rounded-xl">
      
      {playing ? (
        videoUrl ? (
          <video
            className="w-full h-full object-contain"
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
              className="absolute inset-0 w-full h-full object-contain group-hover:scale-102 transition-transform duration-500 opacity-80" 
            />
          )}

          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

          <div className="bg-[#2F52E0] rounded-full p-6 mx-auto w-fit mb-4 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(47,82,224,0.5)] z-10 relative">
            <Play className="h-10 w-10 text-white fill-white" />
          </div>

          <p className="text-white text-sm font-semibold tracking-widest uppercase z-10 relative drop-shadow-lg">
            Clique para iniciar a aula
          </p>
        </div>
      )}

      <button
        onClick={onToggleAI}
        className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 hover:bg-white/20 transition-all z-20 cursor-pointer active:scale-95"
      >
        <Sparkles className="h-3 w-3 text-purple-400 animate-pulse" />
        Dúvidas nesta parte?
      </button>
    </div>
  );
}