import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

interface UseVideoPlayerProps {
  lesson: any;
  onMarkComplete?: () => Promise<void> | void;
  onNextLesson?: () => void;
  hasNextLesson?: boolean;
  isCompleted?: boolean;
}

export function useVideoPlayer({ lesson, onMarkComplete, onNextLesson, hasNextLesson = false, isCompleted }: UseVideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const marked98Ref = useRef(false);

  const rawVideoPath = lesson?.video || lesson?.video_url;
  const rawThumbnail = lesson?.thumbnail; 

  const getThumbnailUrl = (thumb?: string | null) => {
    if (!thumb || typeof thumb !== "string" || thumb.trim() === "") return null;
    if (thumb.startsWith("http://") || thumb.startsWith("https://")) return thumb;
    const { data } = supabase.storage.from("course-thumbnails").getPublicUrl(thumb);
    return data.publicUrl;
  };

  const lessonThumbnail = getThumbnailUrl(rawThumbnail);

  useEffect(() => {
    setPlaying(false);
    setVideoSrc(null);
    setCurrentTime(0);
    setDuration(0);
    setCountdown(null);
    setVideoEnded(false);
    marked98Ref.current = false;
  }, [lesson]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      if (hasNextLesson && onNextLesson && autoPlayNext) {
        onNextLesson();
      }
      setCountdown(null);
      return;
    }
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, hasNextLesson, onNextLesson, autoPlayNext]);

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
      console.error("Erro ao gerar URL assinada:", err);
    } finally {
      setLoadingUrl(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    setCurrentTime(current);

    if (!total || total === 0) return;

    const percent = (current / total) * 100;
    if (percent >= 98 && !marked98Ref.current && !isCompleted) {
      marked98Ref.current = true;
      if (onMarkComplete) onMarkComplete();
    }
  };

  const handleEnded = () => {
    setPlaying(false);
    setVideoEnded(true);
    if (hasNextLesson && autoPlayNext) {
      setCountdown(7); 
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setPlaying(true);
      setVideoEnded(false);
      setCountdown(null);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    setVideoEnded(false);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 1;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullScreen = () => {
    if (videoRef.current && videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return {
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
    handleLoadedMetadata: () => { if (videoRef.current) setDuration(videoRef.current.duration); },
    handleEnded,
    handleRestart,
    handleSeek,
    handleVolumeChange,
    toggleMute,
    changeSpeed,
    toggleFullScreen,
    formatTime
  };
}