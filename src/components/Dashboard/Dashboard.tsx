import React from "react";
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
  const { userStats, isSearching } = useAppStore();

  return (
    <div className="h-full flex flex-col space-y-3">
      <div className="flex justify-between items-center flex-shrink-0">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <VideoSearchToggle />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 flex-shrink-0">
        <StatsCard
          title="Watch Time"
          value={formatWatchTime(userStats.totalWatchTime)}
          icon={<Clock className="h-8 w-8 text-blue-500" />}
          color="bg-blue-100 dark:bg-blue-900"
        />
        <StatsCard
          title="Completed"
          value={`${userStats.completedVideos} videos`}
          icon={<CheckCircle className="h-8 w-8 text-green-500" />}
          color="bg-green-100 dark:bg-green-900"
        />
        <StatsCard
          title="Current Streak"
          value={`${userStats.currentStreak} days`}
          icon={<Flame className="h-8 w-8 text-orange-500" />}
          color="bg-orange-100 dark:bg-orange-900"
        />
        <StatsCard
          title="Longest Streak"
          value={`${userStats.longestStreak} days`}
          icon={<BarChart className="h-8 w-8 text-purple-500" />}
          color="bg-purple-100 dark:bg-purple-900"
        />
      </div>

      {/* Content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 min-h-0">
        {/* Search or Recent Videos */}
        <div className="lg:col-span-2">
          {isSearching ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 h-full flex flex-col">
              <div className="flex items-center mb-2">
                <Search className="h-4 w-4 mr-2 text-indigo-500" />
                <h2 className="text-lg font-semibold">Find Videos</h2>
              </div>
              <div className="flex-1 overflow-hidden">
                <SearchVideos />
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 h-full flex flex-col">
              <div className="flex items-center mb-2">
                <Play className="h-4 w-4 mr-2 text-indigo-500" />
                <h2 className="text-lg font-semibold">Recent Videos</h2>
              </div>
              <div className="flex-1 overflow-hidden">
                <RecentVideos />
              </div>
            </div>
          )}
        </div>

        {/* Calendar events */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 h-full flex flex-col">
          <div className="flex items-center mb-2">
            <CalendarIcon className="h-4 w-4 mr-2 text-indigo-500" />
            <h2 className="text-lg font-semibold">Reminders</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <UpcomingReminders />
          </div>
        </div>
      </div>
    </div>
  );
};

// Stats card component
interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className={`${color} rounded-lg p-2 shadow-md flex items-center`}>
      <div className="rounded-full p-2 mr-2 bg-white dark:bg-gray-800">
        <div className="scale-75">{icon}</div>
      </div>
      <div>
        <p className="text-xs font-medium opacity-70">{title}</p>
        <p className="text-sm font-bold">{value}</p>
      </div>
    </div>
  );
};

// Helper function to format watch time in hours and minutes
const formatWatchTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds} sec`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
};

export default Dashboard;
