import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Folder, MoreVertical, Edit, Trash2, Play } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Playlist } from '../../types';
import toast from 'react-hot-toast';

const Playlists: React.FC = () => {
  const navigate = useNavigate();
  const { playlists, addPlaylist, updatePlaylist, removePlaylist, setCurrentVideo } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Playlist>>({
    name: '',
    description: '',
  });
  const [showBlur, setShowBlur] = useState(false);
  
  const handleCreatePlaylist = () => {
    setFormData({ name: '', description: '' });
    setIsEditing(false);
    setEditingPlaylistId(null);
    setShowModal(true);
  };
  
  const handleEditPlaylist = (playlist: Playlist) => {
    setFormData({
      name: playlist.name,
      description: playlist.description,
    });
    setIsEditing(true);
    setEditingPlaylistId(playlist.id);
    setShowModal(true);
  };
  
  const handleSubmit = () => {
    if (!formData.name?.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }
    
    if (isEditing && editingPlaylistId) {
      updatePlaylist(editingPlaylistId, formData);
      toast.success('Playlist updated successfully');
    } else {
      const newPlaylist: Playlist = {
        id: crypto.randomUUID(),
        name: formData.name,
        description: formData.description || '',
        videos: [],
        createdAt: new Date().toISOString(),
      };
      
      addPlaylist(newPlaylist);
      toast.success('Playlist created successfully');
    }
    
    setShowModal(false);
  };
  
  const handleDeletePlaylist = (playlist: Playlist) => {
    if (confirm(`Are you sure you want to delete "${playlist.name}"? This cannot be undone.`)) {
      removePlaylist(playlist.id);
      toast.success('Playlist deleted');
    }
  };
  
  const handleWatchVideo = (playlist: Playlist, videoIndex: number) => {
    if (videoIndex >= 0 && videoIndex < playlist.videos.length) {
      setCurrentVideo(playlist.videos[videoIndex]);
      setShowBlur(true);
      navigate('/player'); // Changed route
    }
  };
  
  return (
    <div className="space-y-6">
      {showBlur && <div className="background-blur"></div>}
      <div className={`flex justify-between items-center ${showBlur ? 'no-blur' : ''}`}>
        <h1 className="text-2xl font-bold">My Learning Playlists</h1>
        <button
          onClick={handleCreatePlaylist}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          New Playlist
        </button>
      </div>
      
      {playlists.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <Folder className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h2 className="text-xl font-medium mb-2">No playlists yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Create your first playlist to start organizing your learning videos.
          </p>
          <button
            onClick={handleCreatePlaylist}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Create a Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onEdit={() => handleEditPlaylist(playlist)}
              onDelete={() => handleDeletePlaylist(playlist)}
              onWatchVideo={handleWatchVideo}
            />
          ))}
        </div>
      )}
      
      {/* Create/Edit Playlist Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-bold">
                {isEditing ? 'Edit Playlist' : 'Create New Playlist'}
              </h2>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Playlist Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  placeholder="e.g., JavaScript Fundamentals"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 min-h-[100px]"
                  placeholder="What is this playlist about?"
                ></textarea>
              </div>
            </div>
            
            <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-gray-800 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                {isEditing ? 'Save Changes' : 'Create Playlist'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface PlaylistCardProps {
  playlist: Playlist;
  onEdit: () => void;
  onDelete: () => void;
  onWatchVideo: (playlist: Playlist, videoIndex: number) => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ 
  playlist, 
  onEdit, 
  onDelete, 
  onWatchVideo 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  
  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Get thumbnails for up to 4 videos
  const thumbnails = playlist.videos.slice(0, 4).map(video => video.thumbnail);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Playlist thumbnails grid */}
      <div className="h-40 grid grid-cols-2 grid-rows-2 gap-0.5 bg-gray-200 dark:bg-gray-700">
        {thumbnails.map((thumbnail, index) => (
          <div 
            key={index} 
            className="overflow-hidden"
            onClick={() => onWatchVideo(playlist, index)}
          >
            <img 
              src={thumbnail} 
              alt=""
              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
            />
          </div>
        ))}
        
        {/* Empty placeholders if less than 4 videos */}
        {Array.from({ length: Math.max(0, 4 - thumbnails.length) }).map((_, index) => (
          <div 
            key={`empty-${index}`} 
            className="bg-gray-100 dark:bg-gray-600 flex items-center justify-center"
          >
            <Folder className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
        ))}
      </div>
      
      {/* Playlist info */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{playlist.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {playlist.videos.length} {playlist.videos.length === 1 ? 'video' : 'videos'}
            </p>
          </div>
          
          {/* More options menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border dark:border-gray-700">
                <button
                  onClick={() => {
                    onEdit();
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Playlist
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Playlist
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Description */}
        {playlist.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
            {playlist.description}
          </p>
        )}
        
        {/* Watch button */}
        {playlist.videos.length > 0 && (
          <button
            onClick={() => onWatchVideo(playlist, 0)}
            className="flex items-center mt-4 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors text-sm w-full justify-center"
          >
            <Play className="h-4 w-4 mr-1.5" />
            Watch
          </button>
        )}
      </div>
    </div>
  );
};

export default Playlists;