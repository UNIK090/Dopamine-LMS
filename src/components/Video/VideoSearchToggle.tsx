import React from 'react';
import { Search, List } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const VideoSearchToggle: React.FC = () => {
  const { isSearching, toggleSearchMode } = useAppStore();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-full shadow-md p-1 flex items-center">
      <button
        onClick={!isSearching ? undefined : toggleSearchMode}
        className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          !isSearching 
            ? 'bg-indigo-500 text-white' 
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label="My Videos"
      >
        <List className="h-4 w-4 mr-1.5" />
        <span>My Videos</span>
      </button>
      
      <button
        onClick={isSearching ? undefined : toggleSearchMode}
        className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          isSearching 
            ? 'bg-indigo-500 text-white' 
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label="Search Videos"
      >
        <Search className="h-4 w-4 mr-1.5" />
        <span>Search</span>
      </button>
    </div>
  );
};

export default VideoSearchToggle;