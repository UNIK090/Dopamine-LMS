import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ArrowRight, 
  Plus 
} from 'lucide-react';

const UpcomingReminders: React.FC = () => {
  const navigate = useNavigate();
  
  // This would be replaced with actual data from the Google Calendar API
  const mockReminders = [
    {
      id: '1',
      title: 'Complete React Hooks Tutorial',
      date: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      durationMinutes: 30,
    },
    {
      id: '2',
      title: 'Learn TypeScript Generics',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      durationMinutes: 45,
    },
    {
      id: '3',
      title: 'Advanced CSS Techniques',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      durationMinutes: 60,
    },
  ];
  
  const goToCalendar = () => {
    navigate('/calendar');
  };
  
  return (
    <div>
      <div className="space-y-4">
        {mockReminders.map((reminder) => (
          <div key={reminder.id} className="flex items-start p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-full mr-3">
              <CalendarIcon className="h-5 w-5 text-indigo-500" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium mb-1">{reminder.title}</h3>
              
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  {reminder.date.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                  {' • '}
                  {reminder.date.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                  {' • '}
                  {reminder.durationMinutes} min
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex flex-col space-y-2">
        <button
          onClick={goToCalendar}
          className="w-full bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900 dark:hover:bg-indigo-800 text-indigo-600 dark:text-indigo-300 font-medium py-2 px-4 rounded-md flex items-center justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Reminder
        </button>
        
        <button
          onClick={goToCalendar}
          className="w-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:underline text-sm py-1 px-4"
        >
          View All Reminders
          <ArrowRight className="h-3 w-3 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default UpcomingReminders;