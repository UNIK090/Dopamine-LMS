import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Send, 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Lightbulb,
  Target,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { openaiService } from '../../services/openaiService';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  isLoading?: boolean;
}

const AIAssistant: React.FC = () => {
  const { 
    userStats, 
    dailyActivities, 
    playlists,
    currentVideo,
    realTimeStatistics 
  } = useAppStore();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm Skillra AI, your intelligent learning companion powered by advanced AI. I can analyze your real learning data, create personalized study plans, recommend specific YouTube videos, and help optimize your learning journey. What would you like to explore today?",
      timestamp: new Date(),
      suggestions: [
        "Create a study plan for React",
        "Analyze my learning progress",
        "Recommend videos based on my history",
        "Help me improve my learning efficiency"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Prepare context for AI
      const context = {
        userStats,
        recentVideos: dailyActivities.slice(-5).map(a => a.video),
        learningGoals: [], // Could be expanded
        currentProgress: realTimeStatistics,
        playlists: playlists.map(p => ({ name: p.name, videoCount: p.videos.length }))
      };

      // Get AI response
      const aiResponse = await openaiService.generateResponse(currentInput, context);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Show success toast
      toast.success('AI response generated!');
      
    } catch (error) {
      console.error('AI Assistant Error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm experiencing some technical difficulties. Please check your internet connection and try again.",
        timestamp: new Date(),
        suggestions: ["Try again", "Check connection", "Contact support"]
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to get AI response');
      
    } finally {
      setIsTyping(false);
    }
  };

  const handleSpecializedRequest = async (type: 'study_plan' | 'progress_analysis' | 'recommendations') => {
    setIsTyping(true);
    
    try {
      let aiResponse;
      const recentActivities = dailyActivities.slice(-10);
      
      switch (type) {
        case 'study_plan':
          aiResponse = await openaiService.generateStudyPlan(
            'React and JavaScript',
            'intermediate',
            '4 weeks',
            { userStats, recentVideos: recentActivities }
          );
          break;
          
        case 'progress_analysis':
          aiResponse = await openaiService.analyzeProgress(userStats, recentActivities);
          break;
          
        case 'recommendations':
          const interests = ['React', 'JavaScript', 'TypeScript', 'Web Development'];
          aiResponse = await openaiService.generateVideoRecommendations(
            interests,
            'intermediate',
            recentActivities.map(a => a.video)
          );
          break;
          
        default:
          throw new Error('Unknown request type');
      }
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions
      };
      
      setMessages(prev => [...prev, aiMessage]);
      toast.success('Specialized AI analysis complete!');
      
    } catch (error) {
      console.error('Specialized Request Error:', error);
      toast.error('Failed to generate specialized response');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // In a real app, you'd implement speech recognition here
  };

  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
    // In a real app, you'd implement text-to-speech here
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-purple-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-75"></div>
            <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-2xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Skillra AI Assistant
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Powered by OpenAI GPT-4 • Real learning data analysis
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 dark:text-green-400">AI Ready</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`rounded-2xl p-4 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  {message.suggestions && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className={`flex items-center gap-2 mt-2 text-xs text-gray-500 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}>
                  {message.type === 'ai' && (
                    <>
                      <Sparkles className="h-3 w-3" />
                      <span>AI Assistant</span>
                      <span>•</span>
                    </>
                  )}
                  <span>{message.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
              
              {message.type === 'ai' && (
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mr-3 order-0">
                  <Brain className="h-5 w-5 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mr-3">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-t border-purple-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything about your learning journey..."
              className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleListening}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                isListening 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </motion.button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSpeaking}
            className={`p-3 rounded-2xl transition-colors ${
              isSpeaking
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">Quick actions:</span>
          {[
            { 
              icon: <BookOpen className="h-3 w-3" />, 
              text: "Study Plan", 
              action: () => handleSpecializedRequest('study_plan')
            },
            { 
              icon: <TrendingUp className="h-3 w-3" />, 
              text: "Analyze Progress", 
              action: () => handleSpecializedRequest('progress_analysis')
            },
            { 
              icon: <Target className="h-3 w-3" />, 
              text: "Get Recommendations", 
              action: () => handleSpecializedRequest('recommendations')
            },
            { 
              icon: <Lightbulb className="h-3 w-3" />, 
              text: "Learning Tips", 
              action: "Give me personalized learning tips based on my progress"
            },
          ].map((item, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (typeof item.action === 'function') {
                  item.action();
                } else {
                  handleSuggestionClick(item.action);
                }
              }}
              className="flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              {item.icon}
              {item.text}
            </motion.button>
          ))}
        </div>
        
        {/* Real-time Stats Display */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-xl">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Watch Time: {Math.floor((userStats.totalWatchTime || 0) / 60)}h</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Completed: {userStats.completedVideos || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Streak: {userStats.currentStreak || 0} days</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Playlists: {playlists.length}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AIAssistant;