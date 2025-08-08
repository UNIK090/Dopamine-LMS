import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, RefreshCw, WifiOff, AlertTriangle } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { offlineService } from "../../services/offlineService";
import { Video } from "../../types";
import toast from "react-hot-toast";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const VideoPlayer: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentVideo,
    videoProgress,
    updateVideoProgress,
    notificationSettings,
    setCurrentVideo,
  } = useAppStore();

  const playerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (message: string) => {
    setDebugInfo((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  // Setup offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      addDebugInfo("Connection restored");
    };
    const handleOffline = () => {
      setIsOffline(true);
      addDebugInfo("Connection lost");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load video metadata with offline support
  useEffect(() => {
    if (!currentVideo) {
      navigate("/");
      return;
    }

    const loadVideo = async () => {
      setIsLoading(true);
      setLoadError(null);
      addDebugInfo(`Starting video fetch for ID: ${currentVideo.id}`);

      try {
        const cachedData = await offlineService.getCachedVideoData(currentVideo.id);
        if (cachedData && isOffline) {
          addDebugInfo("Using cached video data");
          setCurrentVideo(cachedData);
          setIsLoading(false);
          return;
        }

        if (!isOffline) {
          const { getVideoDetails } = await import("../../services/youtubeApi");
          const video = await getVideoDetails(currentVideo.id);

          if (!video) {
            throw new Error("Video not found");
          }
          await offlineService.cacheVideoData(currentVideo.id, video);
          setCurrentVideo(video);
        } else {
          throw new Error("No internet connection and no cached data available");
        }
      } catch (error) {
        console.error("Error fetching video:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to load video";
        setLoadError(errorMessage);
        addDebugInfo(`Error: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideo();
  }, [currentVideo?.id, isOffline, setCurrentVideo, navigate]);


  // --- REFACTORED YOUTUBE PLAYER LOGIC ---
  // This useEffect handles the YouTube Player lifecycle.
  // It creates the player once, and then uses the player's API to load new videos.
  useEffect(() => {
    if (!currentVideo || isOffline) return;

    const videoId = currentVideo.id;
    const savedProgress = videoProgress[videoId];
    const startTime = savedProgress ? Math.max(0, savedProgress.timestamp - 2) : 0;

    // If player exists, use its API to load the new video smoothly.
    if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
      const currentLoadedId = ytPlayerRef.current.getVideoData()?.video_id;
      if (currentLoadedId !== videoId) {
        addDebugInfo(`Loading new video via loadVideoById: ${videoId}`);
        ytPlayerRef.current.loadVideoById({
          videoId: videoId,
          startSeconds: Math.floor(startTime),
        });
      }
      return; // Stop here to prevent re-creating the player
    }

    // If player does NOT exist, create it for the first time.
    const createPlayer = () => {
      if (!playerRef.current) return;
      
      addDebugInfo(`Creating new player instance for video: ${videoId}`);
      try {
        ytPlayerRef.current = new window.YT.Player(playerRef.current, {
          height: "100%",
          width: "100%",
          videoId: videoId, // Set the initial video
          playerVars: {
            autoplay: 1,
            start: Math.floor(startTime),
            playsinline: 1,
            modestbranding: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: (event: any) => {
              const errorCode = event.data;
              const errorMessage = getYouTubeErrorMessage(errorCode);
              console.error("YouTube Player Error:", errorCode, errorMessage);
              setLoadError(`Error loading video: ${errorMessage}`);
              addDebugInfo(`Youtubeer Error: ${errorCode} - ${errorMessage}`);
            },
          },
        });
      } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        setLoadError(`Error creating player: ${errorMessage}`);
        addDebugInfo(`Error creating player: ${errorMessage}`);
      }
    };

    // Load the YouTube Iframe API script if it's not already loaded.
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        addDebugInfo("YouTube API already loaded, creating player.");
        createPlayer();
      } else {
        addDebugInfo("Loading YouTube API script.");
        setLoadError(null);
        setIsLoading(true);

        // Define the global callback function that the API will call when ready.
        window.onYouTubeIframeAPIReady = () => {
          addDebugInfo("onYouTubeIframeAPIReady callback triggered.");
          createPlayer();
        };
        
        const tag = document.createElement("script");
        // Use the official and secure API URL.
        tag.src = "https://www.youtube.com/iframe_api";
        tag.async = true;
        tag.onerror = () => {
          setLoadError("Failed to load YouTube API script.");
          addDebugInfo("Failed to load YouTube API script.");
          setIsLoading(false);
        };
        document.body.appendChild(tag);
      }
    };

    loadYouTubeAPI();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      // Destroy player on component unmount to clean up resources.
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
        addDebugInfo("Destroying player on component unmount.");
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
    };
  }, [currentVideo, isOffline]); // Effect runs when the video or online status changes.


  const onPlayerReady = (event: any) => {
    setIsLoading(false);
    setLoadError(null);
    retryCountRef.current = 0;
    setDuration(event.target.getDuration());

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
        const newTime = ytPlayerRef.current.getCurrentTime();
        setCurrentTime(newTime);

        if (currentVideo && Math.floor(newTime) > 0 && Math.floor(newTime) % 15 === 0) {
          updateVideoProgress(
            currentVideo.id,
            newTime,
            ytPlayerRef.current.getDuration(),
          );
        }
      }
    }, 1000);
  };

  const onPlayerStateChange = (event: any) => {
    setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
    addDebugInfo("Player state changed: " + event.data);

    if (event.data === window.YT.PlayerState.ENDED) {
      const wasCompleted = saveVideoProgress(true);
      if (!wasCompleted && notificationSettings.completionNotifications && currentVideo) {
        toast.success("🎉 Video completed! Great job!");
      }
    }
  };

  const saveVideoProgress = (completed = false): boolean => {
    if (!currentVideo || !ytPlayerRef.current) return false;

    const currentTime = ytPlayerRef.current.getCurrentTime();
    const duration = ytPlayerRef.current.getDuration();
    const existingProgress = videoProgress[currentVideo.id];
    const wasAlreadyCompleted = existingProgress?.completed || false;
    const isNowCompleted = completed || currentTime >= duration * 0.95;

    updateVideoProgress(currentVideo.id, currentTime, duration, isNowCompleted);
    return !wasAlreadyCompleted && isNowCompleted;
  };

  const getYouTubeErrorMessage = (errorCode: number): string => {
    const errorMessages: { [key: number]: string } = {
      2: "Invalid video ID provided.",
      5: "An error occurred in the HTML5 player.",
      100: "Video not found or it has been removed.",
      101: "The video owner does not allow embedded players.",
      150: "The video owner does not allow embedded players.",
    };
    return errorMessages[errorCode] || `An unknown error occurred (Code: ${errorCode})`;
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (!currentVideo) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p>Loading video details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {isOffline && (
        <div className="bg-yellow-100 dark:bg-yellow-900 border-b border-yellow-200 dark:border-yellow-700 px-4 py-2 flex items-center justify-center text-center">
          <WifiOff className="h-4 w-4 mr-2 text-yellow-600 dark:text-yellow-400" />
          <span className="text-sm text-yellow-800 dark:text-yellow-200">
            You're offline. Playback may be limited.
          </span>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <div className="p-4 flex-shrink-0">
          <button
            onClick={() => {
              saveVideoProgress();
              navigate(-1);
            }}
            className="flex items-center text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-semibold"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-lg relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              </div>
            )}
            {loadError && (
              <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                 <div className="max-w-md">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-white">Error Loading Video</h3>
                    <p className="text-gray-300 mb-4">{loadError}</p>
                    <div className="flex justify-center space-x-2">
                        <button
                          onClick={handleRetry}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        >
                          <RefreshCw className="h-4 w-4 mr-2 inline" />
                          Retry
                        </button>
                    </div>
                </div>
              </div>
            )}
            <div ref={playerRef} className="w-full h-full"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h1 className="text-xl font-bold mb-2 line-clamp-2">
                {currentVideo.title}
              </h1>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-2">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-lg font-bold mb-3">Description</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {currentVideo.description || "No description available."}
            </p>

            {process.env.NODE_ENV === "development" && debugInfo.length > 0 && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs max-h-40 overflow-y-auto">
                <h4 className="font-bold mb-2">Debug Info:</h4>
                {debugInfo.map((info, index) => (
                  <div key={index} className="text-gray-600 dark:text-gray-400 font-mono">
                    {info}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;