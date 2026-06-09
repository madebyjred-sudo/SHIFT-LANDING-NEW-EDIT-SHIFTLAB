"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AutoplayLoopVideoProps = {
  src: string;
  mimeType?: string;
  poster?: string;
  className?: string;
  priority?: boolean;
  ariaLabel?: string;
  onLoadedMetadata?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  audioEnabled?: boolean;
  showPlayerControls?: boolean;
};

// 0px margin so it only attempts to autoplay when ACTUALLY visible (fixes iOS off-screen block)
const IO_ROOT_MARGIN = "0px";

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z"/></svg>
);
const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M520-200v-560h240v560H520Zm-320 0v-560h240v560H200Zm400-80h80v-400h-80v400Zm-320 0h80v-400h-80v400Zm0-400v400-400Zm320 0v400-400Z"/></svg>
);
const ReplayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M480-160q-133 0-226.5-93.5T160-480q0-133 93.5-226.5T480-800q85 0 149 34.5T740-671v-89h80v240H580v-80h106q-40-54-100.5-87T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q88 0 155-52.5T727-466h83q-26 122-124 194T480-160Z"/></svg>
);
const VolumeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M792-56 671-177q-25 16-53 27.5T560-131v-82q14-5 27.5-10t25.5-12L480-368v208L280-360H120v-240h128L56-792l56-56 736 736-56 56Zm-8-232-58-58q17-31 25.5-65t8.5-70q0-94-55-168T560-749v-82q124 28 202 125.5T840-480q0 53-14.5 102T784-288ZM650-422l-90-90v-130q47 22 73.5 66t26.5 96q0 15-2.5 29.5T650-422ZM480-592 376-696l104-104v208Zm-80 238v-94l-72-72H200v80h114l86 86Zm-36-130Z"/></svg>
);
const VolumeUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M560-131v-82q90-26 145-100t55-167q0-94-55-168T560-749v-82q124 28 202 125.5T840-480q0 93-78 190.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320ZM400-606l-86 86H200v80h114l86 86v-252ZM300-480Z"/></svg>
);
const FullscreenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z"/></svg>
);
const FullscreenExitIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M240-120v-120H120v-80h200v200h-80Zm400 0v-200h200v80H720v120h-80ZM120-640v-80h120v-120h80v200H120Zm520 0v-200h80v120h120v80H640Z"/></svg>
);

export default function AutoplayLoopVideo({
  src,
  mimeType = "video/mp4",
  poster,
  className = "absolute inset-0 h-full w-full object-cover",
  priority = false,
  ariaLabel,
  onLoadedMetadata,
  audioEnabled = false,
  showPlayerControls = false,
}: AutoplayLoopVideoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideControlsTimeoutRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [mediaReady, setMediaReady] = useState(priority);
  const [inViewport, setInViewport] = useState(priority);
  
  const [isPlaying, setIsPlaying] = useState(priority);
  const [isMuted, setIsMuted] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (typeof IntersectionObserver === "undefined") {
      setMediaReady(true);
      setInViewport(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const on = !!entry?.isIntersecting;
        if (on) setMediaReady(true);
        setInViewport(on);
      },
      { rootMargin: IO_ROOT_MARGIN, threshold: 0.1 },
    );

    io.observe(root);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (userInteracted) return;
    setIsPlaying(inViewport);
  }, [inViewport, userInteracted]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !mediaReady) return;

    if (isPlaying) {
      el.muted = isMuted;
      // Use set timeout to clear the stack, often helps iOS Safari digest programmatic play
      setTimeout(() => {
        void el.play().catch(() => {
          el.muted = true;
          setIsMuted(true);
          void el.play().catch(() => setIsPlaying(false));
        });
      }, 50);
    } else {
      el.pause();
    }
  }, [isPlaying, isMuted, mediaReady, src]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !isPlaying) return;

    const updateProgress = () => {
      if (el.duration) {
        setProgress((el.currentTime / el.duration) * 100);
      }
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, mediaReady]);

  useEffect(() => {
    if (!audioEnabled || !isMuted) return;

    const handleScroll = () => {
      setIsMuted(false);
      setUserInteracted(true);
      window.removeEventListener("scroll", handleScroll);
    };

    window.addEventListener("scroll", handleScroll, { once: true, passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [audioEnabled, isMuted]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!(document as any).webkitFullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleLoadedMetadata = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      onLoadedMetadata?.(e);
    },
    [onLoadedMetadata],
  );

  const wakeControls = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimeoutRef.current !== null) {
      window.clearTimeout(hideControlsTimeoutRef.current);
    }
    hideControlsTimeoutRef.current = window.setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  const handleMouseMove = () => {
    if (!isHovering) return;
    wakeControls();
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    wakeControls();
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setShowControls(false);
    if (hideControlsTimeoutRef.current !== null) {
      window.clearTimeout(hideControlsTimeoutRef.current);
    }
  };

  const handleControlInteraction = () => {
    wakeControls();
  };

  const togglePlayPause = () => {
    handleControlInteraction();
    setUserInteracted(true);
    setIsPlaying(!isPlaying);
  };

  const handleReplay = () => {
    handleControlInteraction();
    setUserInteracted(true);
    const el = videoRef.current;
    if (el) {
      el.currentTime = 0;
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    handleControlInteraction();
    setUserInteracted(true);
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = async () => {
    handleControlInteraction();
    const container = rootRef.current;
    const el = videoRef.current;
    if (!container || !el) return;

    if (!isFullscreen) {
      try {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
          if (screen.orientation && (screen.orientation as any).lock) {
            await (screen.orientation as any).lock("landscape").catch(() => {});
          }
        } else if ((el as any).webkitEnterFullscreen) {
          // iOS Safari iPhone fallback
          (el as any).webkitEnterFullscreen();
        }
      } catch (err) {
        console.error("Fullscreen error", err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        if (screen.orientation && (screen.orientation as any).unlock) {
          (screen.orientation as any).unlock();
        }
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  const decorative = !ariaLabel;
  // Always show controls on mobile if they are "awake", on desktop hover is required
  const overlayVisible = showControls || isHovering;

  return (
    <div 
      ref={rootRef} 
      className={`group absolute inset-0 overflow-hidden ${isFullscreen ? 'bg-black' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={wakeControls}
    >
      <video
        ref={videoRef}
        className={className}
        autoPlay
        muted={isMuted}
        loop
        playsInline
        preload={mediaReady ? "metadata" : "none"}
        poster={poster}
        onLoadedMetadata={handleLoadedMetadata}
        aria-hidden={decorative || undefined}
        aria-label={ariaLabel}
      >
        {mediaReady ? <source src={src} type={mimeType} /> : null}
      </video>

      {/* Progress Bar and Controls - Only visible if showPlayerControls is true */}
      {showPlayerControls && (
        <>
          <div className={`absolute bottom-0 left-0 w-full h-[3px] bg-[#F540FF]/20 z-10 transition-opacity duration-500 ${overlayVisible ? 'opacity-100' : 'opacity-30'}`}>
            <div 
              className="h-full bg-[#F540FF] relative rounded-r-full"
              style={{ 
                width: `${progress}%`,
                boxShadow: '0 0 15px 2px rgba(245,64,255,0.7), 0 0 5px rgba(245,64,255,0.9)'
              }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[15px] h-[3px] bg-[#F540FF] rounded-full blur-[2px]" />
            </div>
          </div>

          <div 
            className={`absolute inset-0 flex flex-col justify-center transition-opacity duration-500 pointer-events-none ${
              overlayVisible ? 'opacity-100 bg-black/30' : 'opacity-0'
            }`}
          >
            <div className={`flex justify-center gap-4 pointer-events-auto transition-transform duration-300 ${overlayVisible ? 'scale-100' : 'scale-95'}`}>
              <button
                onClick={togglePlayPause}
                className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white border border-white/20 transition-all transform hover:scale-105"
                aria-label={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
              
              <button
                onClick={handleReplay}
                className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white border border-white/20 transition-all transform hover:scale-105"
                aria-label="Repetir"
              >
                <ReplayIcon />
              </button>

              {audioEnabled && (
                <button
                  onClick={toggleMute}
                  className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white border border-white/20 transition-all transform hover:scale-105"
                  aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                >
                  {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </button>
              )}

              <button
                onClick={toggleFullscreen}
                className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white border border-white/20 transition-all transform hover:scale-105"
                aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              >
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
