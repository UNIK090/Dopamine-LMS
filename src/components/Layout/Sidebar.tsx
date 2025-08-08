import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListVideo, 
  Play, 
  Calendar,
  BookOpen, 
  BarChart,
  Settings 
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const Sidebar: React.FC = () => {
  const { darkMode } = useAppStore();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div 
      className={`${darkMode ? 'bg-gray-800' : 'bg-white'} ${
        collapsed ? 'w-16' : 'w-64'
      } shadow-lg transition-all duration-300 ease-in-out hidden md:block`}
    >
      <div className="py-4 px-2">
        <div className="flex flex-col h-full">
          <div className="space-y-1">
            <NavLink
              to="/"
              className={({ isActive }) => `
                flex items-center px-2 py-2 rounded-md text-sm font-medium 
                ${collapsed ? 'justify-center' : ''}
                ${
                  isActive
                    ? `${darkMode ? 'bg-gray-900 text-white' : 'bg-indigo-100 text-indigo-800'}`
                    : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                }
              `}
            >
              <LayoutDashboard className="h-5 w-5 mr-2" />
              {!collapsed && <span>Dashboard</span>}
            </NavLink>
            
            <NavLink
              to="/playlists"
              className={({ isActive }) => `
                flex items-center px-2 py-2 rounded-md text-sm font-medium 
                ${collapsed ? 'justify-center' : ''}
                ${
                  isActive
                    ? `${darkMode ? 'bg-gray-900 text-white' : 'bg-indigo-100 text-indigo-800'}`
                    : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                }
              `}
            >
              <ListVideo className="h-5 w-5 mr-2" />
              {!collapsed && <span>My Playlists</span>}
            </NavLink>
            
            <NavLink
              to="/player"
              className={({ isActive }) => `
                flex items-center px-2 py-2 rounded-md text-sm font-medium 
                ${collapsed ? 'justify-center' : ''}
                ${
                  isActive
                    ? `${darkMode ? 'bg-gray-900 text-white' : 'bg-indigo-100 text-indigo-800'}`
                    : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                }
              `}
            >
              <Play className="h-5 w-5 mr-2" />
              {!collapsed && <span>Video Player</span>}
            </NavLink>
            
            <NavLink
              to="/calendar"
              className={({ isActive }) => `
                flex items-center px-2 py-2 rounded-md text-sm font-medium 
                ${collapsed ? 'justify-center' : ''}
                ${
                  isActive
                    ? `${darkMode ? 'bg-gray-900 text-white' : 'bg-indigo-100 text-indigo-800'}`
                    : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                }
              `}
            >
              <Calendar className="h-5 w-5 mr-2" />
              {!collapsed && <span>Calendar</span>}
            </NavLink>
            
            <NavLink
              to="/learning-path"
              className={({ isActive }) => `
                flex items-center px-2 py-2 rounded-md text-sm font-medium 
                ${collapsed ? 'justify-center' : ''}
                ${
                  isActive
                    ? `${darkMode ? 'bg-gray-900 text-white' : 'bg-indigo-100 text-indigo-800'}`
                    : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                }
              `}
            >
              <BookOpen className="h-5 w-5 mr-2" />
              {!collapsed && <span>Learning Path</span>}
            </NavLink>
            
            <NavLink
              to="/statistics"
              className={({ isActive }) => `
                flex items-center px-2 py-2 rounded-md text-sm font-medium 
                ${collapsed ? 'justify-center' : ''}
                ${
                  isActive
                    ? `${darkMode ? 'bg-gray-900 text-white' : 'bg-indigo-100 text-indigo-800'}`
                    : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                }
              `}
            >
              <BarChart className="h-5 w-5 mr-2" />
              {!collapsed && <span>Statistics</span>}
            </NavLink>
            
            <NavLink
              to="/settings"
              className={({ isActive }) => `
                flex items-center px-2 py-2 rounded-md text-sm font-medium 
                ${collapsed ? 'justify-center' : ''}
                ${
                  isActive
                    ? `${darkMode ? 'bg-gray-900 text-white' : 'bg-indigo-100 text-indigo-800'}`
                    : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                }
              `}
            >
              <Settings className="h-5 w-5 mr-2" />
              {!collapsed && <span>Settings</span>}
            </NavLink>
          </div>
        </div>
      </div>
      
      {/* Collapse button at the bottom */}
      <div className={`absolute bottom-4 ${collapsed ? 'left-4' : 'right-4'}`}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-2 rounded-full ${
            darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
          } transition-colors`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;