"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { getYoutubeId } from "@/lib/utils/youtube";

interface YouTubePlayerProps {
  videoId: string; // Can be a full URL or an ID
  onEnded?: () => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export function YouTubePlayer({ videoId: rawVideoId, onEnded }: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const videoId = getYoutubeId(rawVideoId);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  useEffect(() => {
    if (!videoId) {
      setError("Invalid video source");
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const initPlayer = () => {
      if (!isMounted || !containerRef.current || !window.YT) return;

      try {
        if (playerRef.current) {
          playerRef.current.destroy();
        }

        playerRef.current = new window.YT.Player(containerRef.current, {
          height: "100%",
          width: "100%",
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            modestbranding: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              if (isMounted) setIsLoading(false);
            },
            onStateChange: (event: any) => {
              if (event.data === 0) {
                onEndedRef.current?.();
              }
            },
            onError: (e: any) => {
              console.error("YouTube Player Error:", e);
              if (isMounted) setError("Failed to load video. It might be private or restricted.");
            }
          },
        });
      } catch (err) {
        console.error("Player initialization failed:", err);
        if (isMounted) setError("Error initializing player");
      }
    };

    // Load API if not already present
    if (!window.YT) {
      // Check if script is already injected
      if (!document.getElementById("youtube-api")) {
        const tag = document.createElement("script");
        tag.id = "youtube-api";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const previousOnReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousOnReady) previousOnReady();
        initPlayer();
      };
    } else {
      initPlayer();
    }

    return () => {
      isMounted = false;
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-primary/10 bg-primary">
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-10 text-white">
          <Loader2 className="size-10 animate-spin text-primary" />
        </div>
      )}
      
      {error && (
        <div className="absolute z-10 inset-0 flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center space-y-4">
          <AlertCircle className="size-12 text-rose-500" />
          <div className="space-y-1">
            <h3 className="font-bold text-lg">Playback Error</h3>
            <p className="text-sm text-slate-400 max-w-xs">{error}</p>
          </div>
        </div>
      )}
      
      {/* Isolated mount point for YouTube API to prevent DOM mutation errors with React siblings */}
      <div className="absolute inset-0 h-full w-full z-0">
        <div ref={containerRef} />
      </div>
    </div>
  );
}
