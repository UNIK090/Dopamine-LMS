import { 
  onValue, 
  ref, 
  update,
  serverTimestamp 
} from 'firebase/database';
import { database } from './firebase';
import { 
  RealTimeProgress, 
  RealTimeStatistics, 
  RealTimeLearningPath 
} from '../types/realtime';

export class RealtimeService {
  private db = database;

  // Learning Path Real-time Updates
  subscribeToLearningPath(userId: string, callback: (data: RealTimeLearningPath) => void) {
    const pathRef = ref(this.db, `learningPath/${userId}`);
    return onValue(pathRef, (snapshot) => {
      const data = snapshot.val();
      callback(data || this.getDefaultLearningPath(userId));
    });
  }

  // Progress Real-time Updates
  subscribeToProgress(userId: string, callback: (progress: Record<string, RealTimeProgress>) => void) {
    const progressRef = ref(this.db, `progress/${userId}`);
    return onValue(progressRef, (snapshot) => {
      callback(snapshot.val() || {});
    });
  }

  // Statistics Real-time Updates
  subscribeToStatistics(userId: string, callback: (stats: RealTimeStatistics) => void) {
    const statsRef = ref(this.db, `statistics/${userId}`);
    return onValue(statsRef, (snapshot) => {
      const data = snapshot.val();
      callback(data || this.getDefaultStatistics(userId));
    });
  }

  // Update progress in real-time
  async updateProgress(userId: string, moduleId: string, progress: Partial<RealTimeProgress>) {
    const progressRef = ref(this.db, `progress/${userId}/${moduleId}`);
    await update(progressRef, {
      ...progress,
      lastAccessed: serverTimestamp(),
    });
  }

  // Update learning path in real-time
  async updateLearningPath(userId: string, learningPath: Partial<RealTimeLearningPath>) {
    const pathRef = ref(this.db, `learningPath/${userId}`);
    await update(pathRef, {
      ...learningPath,
      updatedAt: serverTimestamp(),
    });
  }

  // Update statistics in real-time
  async updateStatistics(userId: string, stats: Partial<RealTimeStatistics>) {
    const statsRef = ref(this.db, `statistics/${userId}`);
    await update(statsRef, {
      ...stats,
      updatedAt: serverTimestamp(),
    });
  }

  private getDefaultLearningPath(userId: string): RealTimeLearningPath {
    return {
      userId,
      modules: [],
      overallProgress: 0,
      estimatedCompletionDate: new Date(),
    };
  }

  private getDefaultStatistics(userId: string): RealTimeStatistics {
    return {
      userId,
      totalVideosWatched: 0,
      totalWatchTime: 0,
      averageSessionDuration: 0,
      weeklyProgress: [],
      skillProgress: [],
      achievements: [],
    };
  }
}

export const realtimeService = new RealtimeService();
