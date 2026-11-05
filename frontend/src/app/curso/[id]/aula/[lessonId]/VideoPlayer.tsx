"use client";

import { Play, Pause, Volume2, VolumeX, Maximize, Loader2, FastForward, Repeat, ToggleLeft, ToggleRight } from "lucide-react";
import { useVideoPlayer } from "../_components/hook/useVideoPlayer";

interface VideoPlayerProps {
  lesson: any;
  onToggleAI: () => void;
  onMarkComplete?: () => Promise<void> | void;
  onNextLesson?: () => void;
  hasNextLesson?: boolean;
  isCompleted?: boolean;
}

export default function VideoPlayer(props: VideoPlayerProps) {
  const {
    playing, setPlaying,
    videoSrc,
    loadingUrl,
    videoRef,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    showSpeedMenu, setShowSpeedMenu,
    autoPlayNext, setAutoPlayNext,
    countdown, setCountdown,
    videoEnded, setVideoEnded,
    lessonThumbnail,
    progressPercent,
    handlePlayClick,
    togglePlay,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleEnded,
    handleRestart,
    handleSeek,
    handleVolumeChange,
    toggleMute,
    changeSpeed,
    toggleFullScreen,
    formatTime
  } = useVideoPlayer(props);

  return (
    <div className="bg-black flex items-center justify-center aspect-video w-full relative select-none overflow-hidden border border-gray-800 group">
      
      {videoSrc ? (
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            className={`w-full h-full object-contain cursor-pointer ${playing ? '' : 'brightness-90'}`}
            src={videoSrc}
            autoPlay
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            onPlay={() => { setPlaying(true); setVideoEnded(false); }}
            onPause={() => setPlaying(false)}
            onClick={togglePlay}
            controlsList="nodownload noremoteplayback"
            disablePictureInPicture
          />

          {videoEnded && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white z-30 animate-fade-in p-6 text-center">
              {props.hasNextLesson && autoPlayNext && countdown !== null ? (
                <>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Avançando automaticamente</p>
                  <p className="text-sm font-medium text-gray-300 mb-2">Próxima aula em</p>
                  <span className="text-6xl font-black text-[#FF7A00] mb-6">{countdown}</span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCountdown(null)}
                      className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Cancelar Auto-Play
                    </button>
                    <button
                      onClick={() => { if (props.onNextLesson) props.onNextLesson(); }}
                      className="px-6 py-2.5 bg-[#FF7A00] hover:bg-[#ea7306] text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Ir Para a Próxima Agora
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                  <button
                    onClick={handleRestart}
                    className="w-full py-5 bg-[#FF7A00] hover:bg-[#ea7306] text-white text-base font-bold rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center gap-3"
                  >
                    <Repeat size={22} /> Reiniciar Vídeo
                  </button>

                  {props.hasNextLesson && props.onNextLesson && (
                    <button
                      onClick={props.onNextLesson}
                      className="text-xs text-gray-400 hover:text-white transition underline cursor-pointer"
                    >
                      Ir para a próxima aula manualmente →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2 z-20">
            
            <div className="relative w-full h-2 flex items-center group/slider cursor-pointer">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
              />
              <div className="absolute inset-x-0 h-1 bg-gray-600/70 rounded-full overflow-hidden group-hover/slider:h-1.5 transition-all">
                <div 
                  className="h-full bg-[#FF7A00] rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div 
                className="absolute h-3 w-3 bg-[#FF7A00] rounded-full shadow-md scale-0 group-hover/slider:scale-100 transition-transform pointer-events-none"
                style={{ left: `calc(${progressPercent}% - 6px)` }}
              />
            </div>

            <div className="flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-4">
                <button onClick={togglePlay} className="hover:text-[#FF7A00] transition cursor-pointer">
                  {playing ? <Pause size={18} /> : <Play size={18} className="fill-white" />}
                </button>

                <div className="flex items-center gap-2">
                  <button onClick={toggleMute} className="hover:text-[#FF7A00] transition cursor-pointer">
                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                <span className="text-gray-300 font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-3 relative">
                
                <button
                  onClick={() => setAutoPlayNext(!autoPlayNext)}
                  title={autoPlayNext ? "Auto-Play Ativado (Avança em 7s)" : "Auto-Play Desativado"}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2 py-1 rounded-md text-[11px] font-medium transition cursor-pointer"
                >
                  <span className="text-gray-300">Auto-Play:</span>
                  {autoPlayNext ? (
                    <span className="text-[#FF7A00] font-bold flex items-center gap-1">On <ToggleRight size={18} className="text-[#FF7A00]" /></span>
                  ) : (
                    <span className="text-gray-400 flex items-center gap-1">Off <ToggleLeft size={18} className="text-gray-400" /></span>
                  )}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md font-bold text-[11px] transition cursor-pointer"
                  >
                    <FastForward size={14} />
                    {playbackRate}x
                  </button>

                  {showSpeedMenu && (
                    <div className="absolute bottom-8 right-0 bg-black/90 border border-gray-700 rounded-xl shadow-xl py-1.5 w-24 z-20 flex flex-col">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => changeSpeed(rate)}
                          className={`px-3 py-1.5 text-left text-xs hover:bg-[#FF7A00] transition cursor-pointer ${playbackRate === rate ? 'font-bold text-[#FF7A00]' : 'text-gray-300'}`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={toggleFullScreen} className="hover:text-[#FF7A00] transition cursor-pointer">
                  <Maximize size={16} />
                </button>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div
          className="w-full h-full flex flex-col items-center justify-center text-center group/cover cursor-pointer relative"
          onClick={handlePlayClick}
        >
          {lessonThumbnail && (
            <img 
              src={lessonThumbnail} 
              alt={props.lesson?.title}
              className="absolute inset-0 w-full h-full object-cover group-hover/cover:scale-101 transition-transform duration-500 opacity-70" 
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          )}

          <div className="absolute inset-0 bg-black/30 group-hover/cover:bg-black/50 transition-colors" />

          <div className="bg-[#FF7A00] hover:bg-[#ea7306] rounded-full p-5 mx-auto w-fit mb-3 group-hover/cover:scale-110 transition-transform shadow-[0_0_30px_rgba(255,122,0,0.4)] z-10 relative flex items-center justify-center">
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