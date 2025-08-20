import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface AIResponse {
  content: string;
  suggestions?: string[];
  type: 'text' | 'study_plan' | 'recommendations' | 'analysis';
}

export class OpenAIService {
  private static instance: OpenAIService;

  private constructor() {}

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  async generateResponse(
    userMessage: string,
    context: {
      userStats?: any;
      recentVideos?: any[];
      learningGoals?: string[];
      currentProgress?: any;
    }
  ): Promise<AIResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(context);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
      
      return this.parseAIResponse(response, userMessage);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return {
        content: "I'm experiencing some technical difficulties. Please try again in a moment.",
        type: 'text'
      };
    }
  }

  async generateStudyPlan(
    topic: string,
    skillLevel: 'beginner' | 'intermediate' | 'advanced',
    timeframe: string,
    context: any
  ): Promise<AIResponse> {
    try {
      const prompt = `Create a detailed study plan for learning ${topic} at ${skillLevel} level over ${timeframe}. 
      
      User's current progress:
      - Total watch time: ${context.userStats?.totalWatchTime || 0} minutes
      - Completed videos: ${context.userStats?.completedVideos || 0}
      - Current streak: ${context.userStats?.currentStreak || 0} days
      
      Format the response as a structured study plan with:
      1. Weekly breakdown
      2. Specific topics to cover
      3. Recommended video types
      4. Practice exercises
      5. Milestones and checkpoints
      
      Make it personalized and actionable.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert learning advisor specializing in creating personalized study plans for online video-based learning."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.6,
      });

      const response = completion.choices[0]?.message?.content || "Unable to generate study plan.";
      
      return {
        content: response,
        type: 'study_plan',
        suggestions: [
          "Adjust timeline",
          "Add more topics",
          "Focus on practical projects",
          "Include assessment methods"
        ]
      };
    } catch (error) {
      console.error('Study Plan Generation Error:', error);
      return {
        content: "I couldn't generate a study plan right now. Please try again.",
        type: 'study_plan'
      };
    }
  }

  async analyzeProgress(userStats: any, recentActivities: any[]): Promise<AIResponse> {
    try {
      const prompt = `Analyze this user's learning progress and provide insights:

      Statistics:
      - Total watch time: ${userStats.totalWatchTime} minutes
      - Completed videos: ${userStats.completedVideos}
      - Current streak: ${userStats.currentStreak} days
      - Longest streak: ${userStats.longestStreak} days

      Recent Activities:
      ${recentActivities.map(activity => 
        `- ${activity.video.title} (${activity.completed ? 'Completed' : 'In Progress'})`
      ).join('\n')}

      Provide:
      1. Strengths and achievements
      2. Areas for improvement
      3. Personalized recommendations
      4. Motivation and encouragement
      5. Specific next steps

      Be encouraging but honest about areas that need work.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a supportive learning analytics expert who helps students understand their progress and improve their learning strategies."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1200,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || "Unable to analyze progress.";
      
      return {
        content: response,
        type: 'analysis',
        suggestions: [
          "Set new goals",
          "View detailed metrics",
          "Compare with benchmarks",
          "Export progress report"
        ]
      };
    } catch (error) {
      console.error('Progress Analysis Error:', error);
      return {
        content: "I couldn't analyze your progress right now. Please try again.",
        type: 'analysis'
      };
    }
  }

  async generateVideoRecommendations(
    userInterests: string[],
    skillLevel: string,
    recentVideos: any[]
  ): Promise<AIResponse> {
    try {
      const prompt = `Based on this user's learning profile, recommend specific YouTube videos/channels:

      Interests: ${userInterests.join(', ')}
      Skill Level: ${skillLevel}
      Recently Watched: ${recentVideos.map(v => v.title).join(', ')}

      Provide:
      1. 5-7 specific video recommendations with titles and channel names
      2. Brief explanation of why each video is recommended
      3. Suggested viewing order
      4. Expected learning outcomes

      Focus on high-quality educational content that builds on their current knowledge.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert curator of educational YouTube content with deep knowledge of programming, technology, and online learning resources."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1200,
        temperature: 0.6,
      });

      const response = completion.choices[0]?.message?.content || "Unable to generate recommendations.";
      
      return {
        content: response,
        type: 'recommendations',
        suggestions: [
          "Search for these videos",
          "Create playlist",
          "Adjust difficulty level",
          "Find similar content"
        ]
      };
    } catch (error) {
      console.error('Recommendations Error:', error);
      return {
        content: "I couldn't generate recommendations right now. Please try again.",
        type: 'recommendations'
      };
    }
  }

  private buildSystemPrompt(context: any): string {
    return `You are Skillra AI, an advanced learning assistant specializing in YouTube-based education. You help users optimize their learning journey through personalized guidance, progress analysis, and smart recommendations.

    User Context:
    - Total watch time: ${context.userStats?.totalWatchTime || 0} minutes
    - Completed videos: ${context.userStats?.completedVideos || 0}
    - Current streak: ${context.userStats?.currentStreak || 0} days
    - Recent videos: ${context.recentVideos?.map(v => v.title).slice(0, 3).join(', ') || 'None'}

    Your capabilities:
    1. Create personalized study plans
    2. Analyze learning progress and patterns
    3. Recommend specific YouTube videos and channels
    4. Provide learning strategies and tips
    5. Help set and track learning goals
    6. Offer motivation and encouragement

    Always be:
    - Encouraging and supportive
    - Specific and actionable
    - Data-driven when possible
    - Focused on practical learning outcomes
    - Aware of different learning styles

    Format responses clearly with headings, bullet points, and actionable advice.`;
  }

  private parseAIResponse(response: string, userMessage: string): AIResponse {
    const lowerMessage = userMessage.toLowerCase();
    
    let type: AIResponse['type'] = 'text';
    let suggestions: string[] = [];

    if (lowerMessage.includes('study plan') || lowerMessage.includes('plan')) {
      type = 'study_plan';
      suggestions = ["Adjust timeline", "Add more topics", "Focus on specific areas", "Create daily schedule"];
    } else if (lowerMessage.includes('recommend') || lowerMessage.includes('video')) {
      type = 'recommendations';
      suggestions = ["Search for videos", "Create playlist", "Filter by difficulty", "Find similar content"];
    } else if (lowerMessage.includes('progress') || lowerMessage.includes('analyze')) {
      type = 'analysis';
      suggestions = ["Set new goals", "View detailed stats", "Compare progress", "Export report"];
    } else {
      suggestions = ["Create study plan", "Analyze progress", "Get recommendations", "Set learning goals"];
    }

    return {
      content: response,
      type,
      suggestions
    };
  }
}

export const openaiService = OpenAIService.getInstance();