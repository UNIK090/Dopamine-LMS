import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import LearningPathWithRealtime from './components/LearningPath/LearningPathWithRealtime';
import StatisticsDashboardWithRealtime from './components/Statistics/StatisticsDashboardWithRealtime';
import CalendarView from './components/Calendar/CalendarView';
import Playlists from './components/Playlists/Playlists';
import SettingsDashboard from './components/Settings/SettingsDashboard';
import VideoPlayer from './components/Video/VideoPlayer';
import SearchVideos from './components/Video/SearchVideos';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { useRealtimeData } from './hooks/useRealtimeData';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  useRealtimeData();

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="learning-path" element={<LearningPathWithRealtime />} />
              <Route path="statistics" element={<StatisticsDashboardWithRealtime />} />
              <Route path="calendar" element={<CalendarView />} />
              <Route path="playlists" element={<Playlists />} />
              <Route path="settings" element={<SettingsDashboard />} />
              <Route path="player" element={<VideoPlayer />} />
              <Route path="search" element={<SearchVideos />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
