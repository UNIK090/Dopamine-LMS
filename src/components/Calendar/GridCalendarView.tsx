import React, { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Play, Eye, Clock } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { DailyVideoActivity } from '../../types';

interface GridCalendarViewProps {
  onVideoClick?: (activity: DailyVideoActivity) => void;
}

const GridCalendarView: React.FC<GridCalendarViewProps> = ({ onVideoClick }) => {
  const navigate = useNavigate();
  const { getActivitiesForDate, setCurrentVideo } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<DailyVideoActivity[]>([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<DailyVideoActivity | null>(null);

  // Generate calendar days
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dateString = format(date, 'yyyy-MM-dd');
    const activities = getActivitiesForDate(dateString);
    setSelectedActivities(activities);
  };

  const handleVideoClick = (activity: DailyVideoActivity) => {
    if (onVideoClick) {
      onVideoClick(activity);
    } else {
      setSelectedVideo(activity);
      setShowVideoModal(true);
    }
  };

  const handlePlayVideo = (activity: DailyVideoActivity) => {
    setCurrentVideo(activity.video);
    navigate('/video');
  };

  const getActivitiesForDay = (date: Date): DailyVideoActivity[] => {
    const dateString = format(date, 'yyyy-MM-dd');
    return getActivitiesForDate(dateString);
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  return (
    <div className="h-screen flex flex-col p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Learning Calendar
        </h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePreviousMonth}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleGoToToday}
            className="px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Month and Year */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="bg-gray-50 dark:bg-gray-800 p-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 flex-1">
          {calendarDays.map((date) => {
            const activities = getActivitiesForDay(date);
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
            const isTodayDate = isToday(date);

            return (
              <div
                key={date.toISOString()}
                className={`bg-white dark:bg-gray-800 p-2 border-r border-b border-gray-200 dark:border-gray-700 min-h-[120px] flex flex-col ${
                  !isCurrentMonth ? 'opacity-50' : ''
                } ${isSelected ? 'ring-2 ring-indigo-500' : ''} ${
                  isTodayDate ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                } hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer`}
                onClick={() => handleDateClick(date)}
              >
                {/* Date Number */}
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-medium ${
                    isTodayDate ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {format(date, 'd')}
                  </span>
                  {activities.length > 0 && (
                    <span className="text-xs bg-indigo-500 text-white rounded-full px-1.5 py-0.5">
                      {activities.length}
                    </span>
                  )}
                </div>

                {/* Video Thumbnails */}
                <div className="flex-1 space-y-1 overflow-hidden">
                  {activities.slice(0, 3).map((activity, idx) => (
                    <div
                      key={activity.id}
                      className="group relative cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVideoClick(activity);
                      }}
                    >
                      <div className="relative">
                        <img
                          src={activity.video.thumbnail}
                          alt={activity.video.title}
                          className="w-full h-8 object-cover rounded-sm"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                          <Play className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {activity.completed && (
                          <div className="absolute top-0 right-0 bg-green-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-xs">
                            ✓
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-full left-0 mb-1 bg-black text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {activity.video.title}
                        <div className="text-gray-300">
                          {formatDuration(activity.watchTime)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {activities.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      +{activities.length - 3} more
                    </div>
                  )}
                </div>

                {/* Empty state */}
                {activities.length === 0 && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      No videos
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Video Detail Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {selectedVideo.video.title}
                </h3>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ×
                </button>
              </div>
              
              <div className="aspect-video mb-4">
                <img
                  src={selectedVideo.video.thumbnail}
                  alt={selectedVideo.video.title}
                  className="w-full h-full object-cover rounded"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Duration: {formatDuration(selectedVideo.watchTime)}</span>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePlayVideo(selectedVideo)}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play Video
                  </button>
                  <button
                    onClick={() => setShowVideoModal(false)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GridCalendarView;
