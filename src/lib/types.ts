import type { LucideIcon } from 'lucide-react';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  progress: number;
  type: 'weekly' | 'monthly';
}

export interface ProgressRecord {
    date: string; // YYYY-MM-DD
    progress: number;
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
