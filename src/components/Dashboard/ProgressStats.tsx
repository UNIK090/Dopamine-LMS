import React from 'react';
import { useAppStore } from '../../store/useAppStore';

const ProgressStats: React.FC = () => {
  const { videoProgress, playlists } = useAppStore();
  
  // Calculate stats for visualization
  const stats = React.useMemo(() => {
    // Count videos by completion status
    const completedCount = Object.values(videoProgress).filter(
      progress => progress.completed
    ).length;
    
    const inProgressCount = Object.values(videoProgress).filter(
      progress => !progress.completed && progress.timestamp > 0
    ).length;
    
    // Total videos across all playlists (unique)
    const allVideoIds = new Set<string>();
    playlists.forEach(playlist => {
      playlist.videos.forEach(video => {
        allVideoIds.add(video.id);
      });
    });
    
    const totalVideos = allVideoIds.size;
    const notStartedCount = totalVideos - completedCount - inProgressCount;
    
    // For weekly progress chart (last 7 days)
    const lastSevenDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().slice(0, 10);
    });
    
    const dailyProgress = lastSevenDays.map(date => {
      const dayProgress = Object.values(videoProgress).filter(progress => {
        const progressDate = new Date(progress.lastWatched).toISOString().slice(0, 10);
        return progressDate === date;
      });
      
      return {
        date: date,
        count: dayProgress.length,
        completed: dayProgress.filter(p => p.completed).length,
      };
    });
    
    return {
      completedCount,
      inProgressCount,
      notStartedCount,
      totalVideos,
      dailyProgress,
    };
  }, [videoProgress, playlists]);
  
  return (
    <div className="space-y-6">
      {/* Completion status */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Video Completion Status
        </h3>
        
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              {stats.totalVideos > 0 ? (
                <div className="flex h-full">
                  <div 
                    className="bg-green-500" 
                    style={{ width: `${(stats.completedCount / stats.totalVideos) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-amber-500" 
                    style={{ width: `${(stats.inProgressCount / stats.totalVideos) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-gray-400 dark:bg-gray-500" 
                    style={{ width: `${(stats.notStartedCount / stats.totalVideos) * 100}%` }}
                  ></div>
                </div>
              ) : (
                <div className="h-full bg-gray-400 dark:bg-gray-500 w-full"></div>
              )}
            </div>
            
            <div className="flex justify-between mt-2">
              <div className="space-y-1">
                <div className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-green-500 mr-1.5"></span>
                  <span className="text-xs">Completed</span>
                </div>
                <p className="text-sm font-medium">{stats.completedCount} videos</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-amber-500 mr-1.5"></span>
                  <span className="text-xs">In Progress</span>
                </div>
                <p className="text-sm font-medium">{stats.inProgressCount} videos</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-gray-400 dark:bg-gray-500 mr-1.5"></span>
                  <span className="text-xs">Not Started</span>
                </div>
                <p className="text-sm font-medium">{stats.notStartedCount} videos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Weekly activity chart */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Weekly Learning Activity
        </h3>
        
        <div className="h-40">
          <div className="flex h-32 items-end justify-between">
            {stats.dailyProgress.map((day, index) => {
              const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
              const maxCount = Math.max(...stats.dailyProgress.map(d => d.count));
              const height = maxCount > 0 ? `${(day.count / maxCount) * 100}%` : '0%';
              const completedHeight = maxCount > 0 ? `${(day.completed / maxCount) * 100}%` : '0%';
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full px-1 flex justify-center h-full">
                    <div 
                      className="w-full max-w-[24px] bg-indigo-200 dark:bg-indigo-700 rounded-sm"
                      style={{ height }}
                    ></div>
                    <div 
                      className="absolute bottom-0 w-full max-w-[24px] bg-indigo-500 rounded-sm"
                      style={{ height: completedHeight }}
                    ></div>
                  </div>
                  <div className="text-xs mt-2">{dayName}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressStats;