import React, { useEffect, useState } from "react";
import {
  Play,
  Clock,
  CheckCircle,
  BarChart,
  Calendar as CalendarIcon,
  Search,
  Flame,
} from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import VideoSearchToggle from "../Video/VideoSearchToggle";
import RecentVideos from "./RecentVideos";
import ProgressStats from "./ProgressStats";
import UpcomingReminders from "./UpcomingReminders";
import SearchVideos from "../Video/SearchVideos";

const Dashboard: React.FC = () => {
  const { 
    userStats, 
    isSearching, 
    setIsSearching, 
    darkMode,
    realTimeStatistics,
    realTimeLearningPath,
    userName
  } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    // You can fetch real-time data here if needed
  }, []);

  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className={`h-full flex flex-col space-y-4 p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Dashboard</h1>
        <VideoSearchToggle />
      </div>

      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${
        darkMode ? 'text-gray-200' : 'text-gray-800'
      }`}>
        <h2 className="text-xl font-semibold mb-2">Welcome&nbsp;{userName || 'User'}!</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Here's an overview of your learning progress.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Watch Time"
          value={formatWatchTime(userStats.totalWatchTime)}
          icon={<Clock className="h-8 w-8" />}
          color={darkMode ? 'bg-blue-900' : 'bg-blue-100'}
        />
        <StatsCard
          title="Completed Videos"
          value={userStats.completedVideos.toString()}
          icon={<CheckCircle className="h-8 w-8" />}
          color={darkMode ? 'bg-green-900' : 'bg-green-100'}
        />
        <StatsCard
          title="Current Streak"
          value={`${userStats.currentStreak} days`}
          icon={<Flame className="h-8 w-8" />}
          color={darkMode ? 'bg-orange-900' : 'bg-orange-100'}
        />
        <StatsCard
          title="Longest Streak"
          value={`${userStats.longestStreak} days`}
          icon={<BarChart className="h-8 w-8" />}
          color={darkMode ? 'bg-purple-900' : 'bg-purple-100'}
        />
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow">
        {/* Video section */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            {isSearching ? (
              <>
                <Play className="h-5 w-5 mr-2" />
                Find Videos
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Recent Videos
              </>
            )}
          </h2>
          {isSearching ? <SearchVideos /> : <RecentVideos />}
        </div>

        {/* Reminders section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Upcoming Reminders
          </h2>
          <UpcomingReminders />
        </div>
      </div>

      {/* Real-time statistics and learning path */}
      {(realTimeStatistics || realTimeLearningPath) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {realTimeStatistics && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold mb-4">Real-time Statistics</h2>
              {/* Display real-time statistics here */}
            </div>
          )}
          {realTimeLearningPath && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold mb-4">Learning Path Progress</h2>
              {/* Display real-time learning path progress here */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => (
  <div className={`${color} rounded-lg shadow p-4 flex items-center`}>
    <div className="mr-4">{icon}</div>
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

export default Dashboard;