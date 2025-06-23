import type { LucideIcon } from 'lucide-react';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface Goal {
  id:string;
  title: string;
  progress: number;
  type: 'weekly' | 'monthly';
  imageUrl?: string;
}

export interface ProgressRecord {
    date: string; // YYYY-MM-DD
    progress: number;
    completedTasks: number;
    totalTasks: number;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    unlocked: boolean;
}

export interface UserStats {
    level: number;
    xp: number;
}

export interface NotificationSettings {
    dailyReminders: boolean;
    weeklyReviewReminders: boolean;
}

export interface AppNotification {
    id: string;
    message: string;
    type: 'achievement' | 'levelup' | 'reminder';
    createdAt: string; // ISO string
    read: boolean;
}
