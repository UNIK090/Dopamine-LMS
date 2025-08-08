import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { formatDistanceToNow } from 'date-fns';
import { Video } from '../../types';
import CalendarView from './components/Calendar/CalendarView';

const RecentVideos: React.FC = () => {
  const navigate = useNavigate();
  const { videoProgress, playlists, setCurrentVideo } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const recentVideos = useMemo(() => {
    const progressEntries = Object.values(videoProgress);
    
    progressEntries.sort((a, b) => {
      return new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime();
    });
    
    const recentIds = progressEntries.slice(0, 5).map(entry => entry.videoId);
    
    const videos: Video[] = [];
    
    for (const id of recentIds) {
      for (const playlist of playlists) {
        const video = playlist.videos.find(v => v.id === id);
        if (video && !videos.some(v => v.id === id)) {
          videos.push({
            ...video,
            playlistId: playlist.id
          });
        }
      }
    }
    
    return videos;
  }, [videoProgress, playlists]);
  
  const progressMap = useMemo(() => {
    return Object.values(videoProgress).reduce((map, progress) => {
      map[progress.videoId] = progress;
      return map;
    }, {} as Record<string, typeof videoProgress[keyof typeof videoProgress>);
  }, [videoProgress]);
  
  const handleVideoClick = (video: Video) => {
    setCurrentVideo(video);
    navigate('/player');
  };
  
  if (recentVideos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No recently watched videos.</p>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Search for videos and add them to your playlists to get started.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {recentVideos.map((video) => {
        const progress = progressMap[video.id];
        const progressPercent = progress 
          ? Math.min(Math.round((progress.timestamp / progress.duration) * 100), 100)
          : 0;
          
        return (
          <div 
            key={video.id}
            className="flex flex-col sm:flex-row gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            onClick={() => handleVideoClick(video)}
          >
            <div className="relative sm:w-48 flex-shrink-0">
              <img 
                src={video.thumbnail} 
                alt={video.title} 
                className="w-full h-28 sm:h-full object-cover rounded-md"
              />
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded">
                {video.duration || '??:??'}
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium line-clamp-2">{video.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{video.channelTitle}</p>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Last watched {formatDistanceToNow(new Date(progress?.lastWatched || new Date()), { addSuffix: true })}
              </p>
              
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mt-2">
                <div 
                  className={`h-full rounded-full ${progress?.completed ? 'bg-green-500' : 'bg-indigo-500'}`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span>{formatTime(progress?.timestamp || 0)}</span>
                <span>
                  {progress?.completed ? 'Completed' : `${progressPercent}%`}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default RecentVideos;