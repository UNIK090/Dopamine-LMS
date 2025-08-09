import React from 'react';
import { useAppStore } from '../../store/useAppStore';

const Statistics: React.FC = () => {
  const { userStats } = useAppStore();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Learning Statistics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Watch Time" value={`${Math.round(userStats.totalWatchTime / 60)} minutes`} />
        <StatCard title="Completed Videos" value={userStats.completedVideos.toString()} />
        <StatCard title="Current Streak" value={`${userStats.currentStreak} days`} />
        <StatCard title="Longest Streak" value={`${userStats.longestStreak} days`} />
        <StatCard title="Average Daily Watch Time" value={`${Math.round(userStats.averageDailyWatchTime / 60)} minutes`} />
        <StatCard title="Total Learning Days" value={userStats.totalLearningDays.toString()} />
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
    <h2 className="text-lg font-semibold mb-2">{title}</h2>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default Statistics;