import React, { useEffect, useState } from "react";
import {
  Play,
  Clock,
  CheckCircle,
  BarChart,
  Calendar as CalendarIcon,
  Flame,
  Sparkles,
  TrendingUp,
  Zap,
  Brain,
  Target,
  Award,
} from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import VideoSearchToggle from "../Video/VideoSearchToggle";
import RecentVideos from "./RecentVideos";
import UpcomingReminders from "./UpcomingReminders";
import SearchVideos from "../Video/SearchVideos";
import { motion } from "framer-motion";

// Define the type for the StatsCard props
interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  isAI?: boolean;
}

// Enhanced StatsCard component
const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, trend, isAI }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    className={`${color} rounded-2xl shadow-lg p-6 relative overflow-hidden group cursor-pointer transition-all duration-300`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          {icon}
        </div>
        {isAI && (
          <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
            <Sparkles className="h-3 w-3" />
            <span className="text-xs font-medium">AI</span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white/90 mb-1">{title}</h3>
        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <span className="text-sm text-white/80 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

// AI Insights Card
const AIInsightsCard: React.FC = () => {
  const { userStats, dailyActivities } = useAppStore();
  
  // Generate real insights based on actual data
  const generateInsights = () => {
    const insights = [];
    
    // Analyze watch time patterns
    const avgWatchTime = userStats.totalWatchTime / Math.max(userStats.completedVideos, 1);
    if (avgWatchTime > 30) {
      insights.push({
        icon: "🎯",
        title: "Optimal Learning Sessions",
        description: `Your average session is ${Math.round(avgWatchTime)} minutes - perfect for deep learning!`
      });
    }
    
    // Analyze completion rate
    const recentActivities = dailyActivities.slice(-10);
    const completionRate = recentActivities.filter(a => a.completed).length / Math.max(recentActivities.length, 1);
    if (completionRate > 0.8) {
      insights.push({
        icon: "📈",
        title: "High Completion Rate",
        description: `You complete ${Math.round(completionRate * 100)}% of videos you start. Excellent focus!`
      });
    }
    
    // Streak analysis
    if (userStats.currentStreak >= 3) {
      insights.push({
        icon: "🔥",
        title: "Learning Momentum",
        description: `${userStats.currentStreak}-day streak! You're building great learning habits.`
      });
    }
    
    // Default insights if no data
    if (insights.length === 0) {
      insights.push(
        {
          icon: "🎯",
          title: "Getting Started",
          description: "Start watching videos to unlock personalized AI insights!"
        },
        {
          icon: "📊",
          title: "Track Progress",
          description: "Your learning patterns will help me provide better recommendations."
        }
      );
    }
    
    return insights.slice(0, 3);
  };
  
  const insights = generateInsights();
  
  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg p-6 text-white"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-white/20 rounded-xl">
        <Brain className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">AI Learning Insights</h3>
        <p className="text-sm text-white/80">Real-time analysis powered by your data</p>
      </div>
    </div>
    
    <div className="space-y-3">
      {insights.map((insight, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/10 rounded-xl p-3"
        >
          <p className="text-sm font-medium mb-1">{insight.icon} {insight.title}</p>
          <p className="text-xs text-white/80">{insight.description}</p>
        </motion.div>
      ))}
    </div>
  </motion.div>
  );
};

// Real-time Activity Feed
const RealTimeActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState([
    { id: 1, type: 'completion', message: 'Completed "React Hooks Deep Dive"', time: '2 min ago', color: 'text-green-500' },
    { id: 2, type: 'streak', message: '7-day learning streak achieved!', time: '1 hour ago', color: 'text-orange-500' },
    { id: 3, type: 'ai', message: 'AI suggested new learning path', time: '3 hours ago', color: 'text-purple-500' },
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">Live Activity</h3>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
      
      <div className="space-y-3">
        {activities.map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
          >
            <div className={`w-2 h-2 rounded-full mt-2 ${activity.color.replace('text-', 'bg-')}`}></div>
            <div className="flex-1">
              <p className="text-sm font-medium">{activity.message}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Main Dashboard component
const Dashboard: React.FC = () => {
  const {
    userStats,
    isSearching,
    darkMode,
    realTimeStatistics,
    realTimeLearningPath,
  } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Ready to continue your learning journey?
          </p>
        </div>
        <VideoSearchToggle />
      </motion.div>

      {/* Stats cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <StatsCard
          title="Watch Time"
          value={formatWatchTime(userStats.totalWatchTime)}
          icon={<Clock className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          trend="+12%"
        />
        <StatsCard
          title="Completed"
          value={userStats.completedVideos.toString()}
          icon={<CheckCircle className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-green-500 to-green-600"
          trend="+8"
        />
        <StatsCard
          title="Current Streak"
          value={`${userStats.currentStreak} days`}
          icon={<Flame className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-orange-500 to-red-500"
          trend="+2"
        />
        <StatsCard
          title="AI Score"
          value="92%"
          icon={<Brain className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-purple-500 to-pink-500"
          trend="+5%"
          isAI={true}
        />
      </motion.div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Video section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Play className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold">
              {isSearching ? "Discover Content" : "Continue Learning"}
            </h2>
            {!isSearching && (
              <div className="ml-auto flex items-center gap-1 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 dark:text-green-400">Live</span>
              </div>
            )}
          </div>
          {isSearching ? <SearchVideos /> : <RecentVideos />}
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AIInsightsCard />
        </motion.div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reminders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <CalendarIcon className="h-6 w-6 text-indigo-500" />
            <h2 className="text-xl font-semibold">Smart Reminders</h2>
            <div className="ml-auto">
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </div>
          </div>
          <UpcomingReminders />
        </motion.div>

        {/* Real-time Activity */}
        <RealTimeActivityFeed />
      </div>

      {/* Floating AI Assistant Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg flex items-center justify-center text-white z-50"
      >
        <Brain className="h-6 w-6" />
      </motion.button>
    </div>
  );
};

export default Dashboard;