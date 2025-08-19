import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, Youtube, Menu, X, User, LogOut, Sparkles, Zap } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import NotificationBell from "../Notifications/NotificationBell";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const Navbar: React.FC = () => {
  const { darkMode, toggleDarkMode } = useAppStore();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOut();
  };

  // Handle click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  // Handle scroll to toggle blur
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`${
        darkMode 
          ? "bg-gray-900/95 text-white border-gray-800" 
          : "bg-white/95 text-gray-900 border-gray-200"
      } backdrop-blur-xl border-b transition-all duration-300 h-20 sticky top-0 z-50 ${
        isScrolled ? "shadow-lg" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-75"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  <Youtube className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Skillra
                </span>
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">AI-Powered</span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-1">
            {[
              { to: "/", label: "Dashboard" },
              { to: "/playlists", label: "Playlists" },
              { to: "/player", label: "Player" },
              { to: "/calendar", label: "Calendar" },
              { to: "/ai-assistant", label: "AI Assistant", isNew: true },
            ].map((item) => (
              <motion.div key={item.to} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to={item.to}
                  className="relative px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
                >
                  <span className="relative z-10">{item.label}</span>
                  {item.isNew && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      NEW
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
              </motion.div>
            ))}
            
            <NotificationBell />

            {/* User Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                aria-label="User menu"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="h-8 w-8 rounded-full ring-2 ring-blue-500/20"
                  />
                ) : (
                  <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
              </motion.button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border dark:border-gray-700 z-50 overflow-hidden"
                  >
                    <div className="p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        {user?.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName || "User"}
                            className="h-12 w-12 rounded-full ring-2 ring-blue-500/20"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {user?.displayName || "User"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user?.email}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Zap className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs text-yellow-600 dark:text-yellow-400">Pro User</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={toggleDarkMode}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
                      >
                        {darkMode ? (
                          <>
                            <Sun className="h-4 w-4 mr-3" />
                            Light Mode
                          </>
                        ) : (
                          <>
                            <Moon className="h-4 w-4 mr-3" />
                            Dark Mode
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSignOut}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className={`p-2 rounded-xl transition-all duration-200 ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <NotificationBell />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {[
                { to: "/", label: "Dashboard" },
                { to: "/playlists", label: "Playlists" },
                { to: "/player", label: "Player" },
                { to: "/calendar", label: "Calendar" },
                { to: "/ai-assistant", label: "AI Assistant" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block px-3 py-2 rounded-xl text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* Mobile User Info */}
              <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 border-opacity-25 mt-2 pt-4">
                <div className="flex items-center space-x-3 mb-4">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="h-10 w-10 rounded-full ring-2 ring-blue-500/20"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user?.displayName || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    toggleDarkMode();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 rounded-xl text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 mb-2"
                >
                  {darkMode ? (
                    <>
                      <Sun className="h-5 w-5 mr-2" /> Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5 mr-2" /> Dark Mode
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 rounded-xl text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;