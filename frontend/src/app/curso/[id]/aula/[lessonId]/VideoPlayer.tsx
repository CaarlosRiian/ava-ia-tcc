import { Play, Sparkles } from "lucide-react";

interface VideoPlayerProps {
  onToggleAI: () => void;
}

export default function VideoPlayer({ onToggleAI }: VideoPlayerProps) {
  return (
    <div className="bg-[#161B1D] flex items-center justify-center aspect-video max-h-[60vh] w-full shadow-2xl relative">
      <div className="text-center group cursor-pointer">
        <div className="bg-[#2F52E0] rounded-full p-6 mx-auto w-fit mb-4 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(47,82,224,0.4)]">
          <Play className="h-10 w-10 text-white fill-white" />
        </div>
        <p className="text-white/40 text-sm font-medium tracking-widest uppercase">Clique para iniciar a aula</p>
      </div>
      
      <button 
        onClick={onToggleAI}
        className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-2 hover:bg-white/20 transition-all"
      >
        <Sparkles className="h-3 w-3 text-purple-400" />
        Possui alguma dúvida nesta parte?
      </button>
    </div>
  );
}