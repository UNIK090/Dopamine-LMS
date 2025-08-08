import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { notificationService } from "../../services/notificationService";
import { DailyVideoActivity, Video } from "../../types";
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

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (message: string) => {
    setDebugInfo((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  useEffect(() => {
  if (!currentVideo) {
      navigate("/");
      return;
    }

    const fetchVideo = async () => {
      setIsLoading(true);
      setLoadError(null);
      addDebugInfo(`Starting video fetch for ID: ${currentVideo.id}`);

      try {
        // Import the youtubeApi service to fetch actual video data
        const { getVideoDetails } = await import("../../services/youtubeApi");
        const video = await getVideoDetails(currentVideo.id);

        console.log("VideoPlayer: fetched video ID =", video?.id);

        if (!video) {
          throw new Error("Video not found");
        }

        addDebugInfo(`Video fetched successfully: ${video.title}`);
        setCurrentVideo(video);
      } catch (error) {
        console.error("Error fetching video:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load video details";
        setLoadError(errorMessage);
        addDebugInfo(`Error fetching video: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [currentVideo, setCurrentVideo, navigate]);

  useEffect(() => {
    if (!currentVideo) return;

    const createPlayer = () => {
      if (!playerRef.current) {
        addDebugInfo("Error: Player container not found");
        return;
      }

      // Avoid recreating player if videoId is the same
      if (ytPlayerRef.current && ytPlayerRef.current.getVideoData) {
        const currentVideoId = ytPlayerRef.current.getVideoData().video_id;
        if (currentVideoId === currentVideo.id) {
          addDebugInfo("Player already created for this video, skipping recreate");
          return;
        }
        addDebugInfo("Destroying existing player");
        ytPlayerRef.current.destroy();
      }

      const videoId = currentVideo.id;
      const savedProgress = videoProgress[videoId];
      const startTime = savedProgress
        ? Math.max(0, savedProgress.timestamp - 2)
        : 0;

      addDebugInfo(
        `Creating player for video: ${videoId} starting at: ${startTime}s`,
      );

      try {
        // Check if YouTube API is available
        if (!window.YT || !window.YT.Player) {
          throw new Error("YouTube API not loaded");
        }

        ytPlayerRef.current = new window.YT.Player(playerRef.current, {
          height: "100%",
          width: "100%",
          videoId: videoId,
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
              addDebugInfo(
                `YouTube Player Error: ${errorCode} - ${errorMessage}`,
              );
              setIsLoading(false);
              // Retry logic with exponential backoff
              retryCount++;
              if (retryCount <= maxRetries) {
                const delay = Math.pow(2, retryCount) * 1000;
                addDebugInfo(`Retrying to create player in ${delay}ms`);
                setTimeout(() => {
                  createPlayer();
                }, delay);
              } else {
                addDebugInfo("Max retries reached, giving up");
              }
            },
          },
        });

        addDebugInfo("YouTube player created successfully");
      } catch (error: any) {
        console.error("Error creating player:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setLoadError(`Error creating player: ${errorMessage}`);
        addDebugInfo(`Error creating player: ${errorMessage}`);
        setIsLoading(false);
      }
    };

    const loadYouTubeAPI = () => {
      if (!window.YT || !window.YT.Player) {
        addDebugInfo("Loading YouTube iframe API");
        setIsLoading(true);
        setLoadError(null);

        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.async = true;

        tag.onload = () => {
          addDebugInfo("YouTube API script loaded");
          // Small delay to ensure API is fully initialized
          setTimeout(() => {
            if (window.YT && window.YT.Player) {
              createPlayer();
            } else {
              window.onYouTubeIframeAPIReady = () => {
                addDebugInfo("YouTube API ready callback triggered");
                createPlayer();
              };
            }
          }, 100);
        };

        tag.onerror = () => {
          setLoadError("Failed to load YouTube API");
          addDebugInfo("Failed to load YouTube API script");
          setIsLoading(false);
        };

        document.body.appendChild(tag);
      } else {
        addDebugInfo("YouTube API already loaded");
        createPlayer();
      }
    };

    loadYouTubeAPI();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (
        ytPlayerRef.current &&
        typeof ytPlayerRef.current.destroy === "function"
      ) {
        addDebugInfo("Cleaning up player");
        ytPlayerRef.current.destroy();
      }
    };
  }, [currentVideo, videoProgress, updateVideoProgress]);

  let retryCount = 0;
  const maxRetries = 3;

  const onPlayerReady = (event: any) => {
    setIsLoading(false);
    setLoadError(null);
    setDuration(event.target.getDuration());

    addDebugInfo("Player is ready");
    try {
      event.target.playVideo();
      addDebugInfo("Video playback started");
    } catch (error) {
      console.error("Error starting video playback:", error);
      addDebugInfo(`Error starting playback: ${error}`);
    }

    // Start a timer to track and save video progress periodically.
    // Save progress every 15 seconds instead of 5.
    timerRef.current = window.setInterval(() => {
      if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
        const newTime = ytPlayerRef.current.getCurrentTime();
        setCurrentTime(newTime);

        // Save progress every 15 seconds.
        if (currentVideo && Math.floor(newTime) % 15 === 0) { // Changed to 15
          addDebugInfo("Saving video progress at:" + newTime); // ADDED
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
    addDebugInfo("Player state changed: " + event.data); // ADDED

    // When video ends, save progress and show notifications.
    if (event.data === window.YT.PlayerState.ENDED) {
      const wasCompleted = saveVideoProgress(true);
      if (!wasCompleted && notificationSettings.completionNotifications && currentVideo) {
        toast.success("🎉 Video completed! Great job!");
        if (notificationService.hasPermission()) {
          notificationService.showVideoCompletionNotification(
            currentVideo.title,
            currentVideo.thumbnail,
          );
        }
      }
    }

    // Save progress when the video is paused.
    if (event.data === window.YT.PlayerState.PAUSED) {
      saveVideoProgress();
    }
  };

  const saveVideoProgress = (completed = false): boolean => {
    if (!currentVideo || !ytPlayerRef.current) return false;

    const currentTime = ytPlayerRef.current.getCurrentTime();
    const duration = ytPlayerRef.current.getDuration();
    const existingProgress = videoProgress[currentVideo.id];
    const wasAlreadyCompleted = existingProgress?.completed || false;
    const isNowCompleted = completed || currentTime >= duration * 0.95;

    updateVideoProgress(currentVideo.id, currentTime, duration);
    return !wasAlreadyCompleted && isNowCompleted;
  };

  const getYouTubeErrorMessage = (errorCode: number): string => {
    const errorMessages: { [key: number]: string } = {
      2: "Invalid video ID",
      5: "HTML5 player error",
      100: "Video not found or removed",
      101: "Video owner blocked embedding",
      150: "Video owner blocked embedding",
      0: "Unknown error occurred",
    };
    return errorMessages[errorCode] || `Error code ${errorCode}`;
  };

  const getPlayerStateName = (state: number): string => {
    const states: { [key: number]: string } = {
      [-1]: "unstarted",
      0: "ended",
      1: "playing",
      2: "paused",
      3: "buffering",
      5: "video cued",
    };
    return states[state] || `unknown (${state})`;
  };

  const handleRetry = () => {
    addDebugInfo("Retrying video load");
    setLoadError(null);
    setIsLoading(true);
    setDebugInfo([]);

    // Force reload of YouTube API
    if (
      ytPlayerRef.current &&
      typeof ytPlayerRef.current.destroy === "function"
    ) {
      ytPlayerRef.current.destroy();
    }

    // Reload the page to reset everything
    window.location.reload();
  };

  if (!currentVideo) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p>Loading video...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="p-4 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-semibold"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 pb-4 flex-1 min-h-0">
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-black aspect-video rounded-lg overflow-hidden relative shadow-lg">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              </div>
            )}
            {loadError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-center p-4">
                <div>
                  <p className="text-red-400 mb-4">{loadError}</p>
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors mr-2"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            )}
            <div ref={playerRef} className="w-full h-full"></div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mt-4">
            <h1 className="text-xl font-bold mb-2 line-clamp-2">
              {currentVideo.title}
            </h1>
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-2">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 overflow-y-auto">
          <h3 className="text-lg font-bold mb-3">Description</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
            {currentVideo.description}
          </p>

          {process.env.NODE_ENV === "development" && debugInfo.length > 0 && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs">
              <h4 className="font-bold mb-2">Debug Info:</h4>
              {debugInfo.map((info, index) => (
                <div key={index} className="text-gray-600 dark:text-gray-400">
                  {info}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

