import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, RefreshCw, WifiOff, AlertTriangle, Brain, Sparkles, MessageCircle } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { offlineService } from "../../services/offlineService";
import { Video } from "../../types";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

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

// AI Insights Panel
const AIInsightsPanel: React.FC<{ currentTime: number; videoTitle: string }> = ({ currentTime, videoTitle }) => {
  const [insights, setInsights] = useState([
    { id: 1, time: 120, type: 'concept', message: 'Key concept: React Hooks introduced here', confidence: 95 },
    { id: 2, time: 300, type: 'practice', message: 'Good time to pause and practice this example', confidence: 88 },
    { id: 3, time: 480, type: 'review', message: 'This builds on previous lesson - consider reviewing', confidence: 92 },
  ]);

  const currentInsight = insights.find(insight => 
    Math.abs(insight.time - currentTime) < 10 && insight.time <= currentTime
  );

  return (
    <AnimatePresence>
      {currentInsight && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-2xl shadow-2xl max-w-sm z-10"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Brain className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold">AI Insight</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {currentInsight.confidence}% confident
                </span>
              </div>
              <p className="text-sm">{currentInsight.message}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Real-time Chat Panel
const RealTimeChatPanel: React.FC<{ isVisible: boolean; onToggle: () => void }> = ({ isVisible, onToggle }) => {
  const [messages, setMessages] = useState([
    { id: 1, user: 'Alex', message: 'Great explanation of useEffect!', time: '2 min ago', avatar: '👨‍💻' },
    { id: 2, user: 'Sarah', message: 'Can someone explain the dependency array?', time: '1 min ago', avatar: '👩‍🎓' },
    { id: 3, user: 'Mike', message: 'Check the docs for more examples', time: '30s ago', avatar: '🧑‍💼' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now(),
      user: 'You',
      message: newMessage,
      time: 'now',
      avatar: '😊'
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="absolute top-0 right-0 w-80 h-full bg-white dark:bg-gray-800 shadow-2xl z-20 flex flex-col"
        >
          <div className="p-4 border-b dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <span className="font-semibold">Live Chat</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <button onClick={onToggle} className="text-white/80 hover:text-white">
                ×
              </button>
            </div>
            <p className="text-xs text-white/80 mt-1">23 viewers watching</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(message => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2"
              >
                <span className="text-lg">{message.avatar}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{message.user}</span>
                    <span className="text-xs text-gray-500">{message.time}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{message.message}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="p-4 border-t dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
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
  const [showChat, setShowChat] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(true);

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

  // YouTube Player setup (same as before but with enhanced UI)
  useEffect(() => {
    if (!currentVideo || isOffline) return;

    const videoId = currentVideo.id;
    const savedProgress = videoProgress[videoId];
    const startTime = savedProgress ? Math.max(0, savedProgress.timestamp - 2) : 0;

    if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
      const currentLoadedId = ytPlayerRef.current.getVideoData()?.video_id;
      if (currentLoadedId !== videoId) {
        addDebugInfo(`Loading new video via loadVideoById: ${videoId}`);
        ytPlayerRef.current.loadVideoById({
          videoId: videoId,
          startSeconds: Math.floor(startTime),
        });
      }
      return;
    }

    const createPlayer = () => {
      if (!playerRef.current) return;
      
      addDebugInfo(`Creating new player instance for video: ${videoId}`);
      try {
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
              addDebugInfo(`YouTube Error: ${errorCode} - ${errorMessage}`);
            },
          },
        });
      } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        setLoadError(`Error creating player: ${errorMessage}`);
        addDebugInfo(`Error creating player: ${errorMessage}`);
      }
    };

    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        addDebugInfo("YouTube API already loaded, creating player.");
        createPlayer();
      } else {
        addDebugInfo("Loading YouTube API script.");
        setLoadError(null);
        setIsLoading(true);

        window.onYouTubeIframeAPIReady = () => {
          addDebugInfo("onYouTubeIframeAPIReady callback triggered.");
          createPlayer();
        };
        
        const tag = document.createElement("script");
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
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
        addDebugInfo("Destroying player on component unmount.");
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
    };
  }, [currentVideo, isOffline]);

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

    updateVideoProgress(currentVideo.id, currentTime, duration);
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
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p>Loading video details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-purple-900 text-gray-900 dark:text-gray-100">
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 flex items-center justify-center text-center"
        >
          <WifiOff className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">
            You're offline. Playback may be limited.
          </span>
        </motion.div>
      )}

      <div className="flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 flex-shrink-0"
        >
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                saveVideoProgress();
                navigate(-1);
              }}
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-xl backdrop-blur-sm transition-all"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back
            </motion.button>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAIInsights(!showAIInsights)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  showAIInsights
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Brain className="h-4 w-4" />
                AI Insights
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowChat(!showChat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  showChat
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300'
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                Live Chat
                <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">23</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="flex-1 flex items-center justify-center px-4 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative"
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                />
              </div>
            )}
            
            {loadError && (
              <div className="absolute inset-0 flex items-center justify-center text-center p-4 bg-black/80">
                <div className="max-w-md">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-white">Error Loading Video</h3>
                  <p className="text-gray-300 mb-4">{loadError}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRetry}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium transition-all"
                  >
                    <RefreshCw className="h-4 w-4 mr-2 inline" />
                    Retry
                  </motion.button>
                </div>
              </div>
            )}
            
            <div ref={playerRef} className="w-full h-full"></div>
            
            {/* AI Insights Overlay */}
            {showAIInsights && (
              <AIInsightsPanel currentTime={currentTime} videoTitle={currentVideo.title} />
            )}
          </motion.div>

          {/* Real-time Chat Panel */}
          <RealTimeChatPanel isVisible={showChat} onToggle={() => setShowChat(false)} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 p-4"
        >
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-4 line-clamp-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {currentVideo.title}
            </h1>
            
            {/* Enhanced Progress Bar */}
            <div className="relative">
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full mb-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                />
              </div>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">{formatTime(currentTime)}</span>
                <div className="flex items-center gap-2">
                  {isPlaying && (
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 dark:text-green-400">Live</span>
                    </div>
                  )}
                  <span className="font-medium">{formatTime(duration)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Enhanced Description
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {currentVideo.description || "No description available."}
            </p>

            {process.env.NODE_ENV === "development" && debugInfo.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-500 dark:text-gray-400">
                  Debug Information
                </summary>
                <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-xs max-h-40 overflow-y-auto">
                  {debugInfo.map((info, index) => (
                    <div key={index} className="text-gray-600 dark:text-gray-400 font-mono mb-1">
                      {info}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VideoPlayer;