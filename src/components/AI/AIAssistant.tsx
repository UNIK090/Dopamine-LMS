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

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your AI learning assistant. I can help you create personalized study plans, recommend videos, track your progress, and answer questions about your learning journey. What would you like to work on today?",
      timestamp: new Date(),
      suggestions: [
        "Create a study plan for React",
        "Recommend videos for my skill level",
        "Analyze my learning progress",
        "Help me set learning goals"
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
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('study plan') || lowerInput.includes('plan')) {
      return {
        content: "I'd be happy to create a personalized study plan for you! Based on your current progress, I recommend focusing on these areas:\n\n📚 **Week 1-2**: JavaScript Fundamentals\n- Variables, functions, and scope\n- Async/await and promises\n- ES6+ features\n\n⚛️ **Week 3-4**: React Basics\n- Components and JSX\n- State and props\n- Event handling\n\n🔧 **Week 5-6**: Advanced React\n- Hooks and context\n- Performance optimization\n- Testing\n\nWould you like me to adjust this plan based on your specific goals?",
        suggestions: ["Adjust the timeline", "Add more topics", "Focus on specific areas", "Create daily schedule"]
      };
    }
    
    if (lowerInput.includes('recommend') || lowerInput.includes('video')) {
      return {
        content: "Based on your learning history and current skill level, here are my top video recommendations:\n\n🎯 **Perfect for you right now:**\n• \"Advanced React Patterns\" by Kent C. Dodds\n• \"TypeScript for React Developers\" by Matt Pocock\n• \"State Management Deep Dive\" by Redux Team\n\n📈 **To level up:**\n• \"Performance Optimization Techniques\"\n• \"Testing React Applications\"\n• \"Next.js Full Course\"\n\nThese align with your 85% completion rate in React basics and your goal to become a senior developer.",
        suggestions: ["Show more recommendations", "Filter by difficulty", "Find shorter videos", "Create playlist"]
      };
    }
    
    if (lowerInput.includes('progress') || lowerInput.includes('analyze')) {
      return {
        content: "Here's your learning analytics:\n\n📊 **Overall Progress:**\n• 47 videos completed this month (+23% from last month)\n• 24.5 hours of focused learning\n• 7-day learning streak 🔥\n\n🎯 **Strengths:**\n• Consistent daily practice\n• High completion rate (92%)\n• Strong in JavaScript fundamentals\n\n⚡ **Areas for improvement:**\n• Spend more time on practical projects\n• Review concepts after 1 week for better retention\n• Consider pair programming sessions\n\nYou're in the top 15% of learners! Keep up the excellent work!",
        suggestions: ["Set new goals", "View detailed stats", "Compare with peers", "Export progress report"]
      };
    }
    
    return {
      content: "I understand you're looking for help with your learning journey. I can assist you with:\n\n🎯 **Study Planning**: Create personalized learning paths\n📚 **Content Recommendations**: Find the perfect videos for your level\n📊 **Progress Tracking**: Analyze your learning patterns\n🎓 **Skill Assessment**: Identify strengths and areas for improvement\n⏰ **Schedule Optimization**: Find your best learning times\n\nWhat specific area would you like to focus on?",
      suggestions: ["Create study plan", "Recommend videos", "Analyze progress", "Set learning goals"]
    };
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
              AI Learning Assistant
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your personal learning companion powered by advanced AI
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 dark:text-green-400">Online</span>
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
            { icon: <Target className="h-3 w-3" />, text: "Set Goals", action: "Help me set learning goals" },
            { icon: <BookOpen className="h-3 w-3" />, text: "Study Plan", action: "Create a study plan" },
            { icon: <TrendingUp className="h-3 w-3" />, text: "Progress", action: "Analyze my progress" },
            { icon: <Lightbulb className="h-3 w-3" />, text: "Tips", action: "Give me learning tips" },
          ].map((item, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSuggestionClick(item.action)}
              className="flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              {item.icon}
              {item.text}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AIAssistant;