'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Task, Goal, ProgressRecord, Achievement, UserStats, NotificationSettings } from '@/lib/types';
import useLocalStorage from '@/hooks/use-local-storage';
import Header from '@/components/header';
import Onboarding from '@/components/onboarding';
import Dashboard from '@/components/dashboard';
import WeeklyReview from '@/components/weekly-review';
import Settings from '@/components/settings';
import ProgressView from '@/components/progress-view';
import AchievementsPage from '@/components/achievements-page';
import Celebration from '@/components/celebration';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Award, Check, Crown, Star, Trophy } from 'lucide-react';

const initialTasks: Task[] = [
  { id: '1', text: 'Complete project proposal', completed: false },
  { id: '2', text: 'Workout for 30 minutes', completed: true },
  { id: '3', text: 'Read 1 chapter of a book', completed: false },
  { id: '4', text: 'Meditate for 10 minutes', completed: true },
];

const initialGoals: Goal[] = [
  { id: 'g1', title: 'Weekly Fitness Goal', progress: 50, type: 'weekly' },
  { id: 'g2', title: 'Monthly Learning Goal', progress: 50, type: 'monthly' },
];

const initialAchievements: Achievement[] = [
    { id: 'first-step', name: 'First Step', description: 'Complete your first task.', icon: Check, unlocked: false },
    { id: 'task-master', name: 'Task Master', description: 'Complete 10 tasks.', icon: Trophy, unlocked: false },
    { id: 'perfect-day', name: 'Perfect Day', description: 'Complete all daily tasks.', icon: Star, unlocked: false },
    { id: 'momentum-king', name: 'Momentum King', description: 'Maintain a 7-day streak.', icon: Crown, unlocked: false },
    { id: 'goal-getter', name: 'Goal Getter', description: 'Achieve 100% on a goal.', icon: Award, unlocked: false },
];

const initialNotificationSettings: NotificationSettings = {
    dailyReminders: true,
    weeklyReviewReminders: true,
};

const XP_PER_TASK = 10;
const LEVEL_UP_BASE_XP = 100;

export default function Home() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('goal-track-ai-tasks', initialTasks);
  const [goals, setGoals] = useLocalStorage<Goal[]>('goal-track-ai-goals', initialGoals);
  const [activeView, setActiveView] = useState<'dashboard' | 'review' | 'settings' | 'progress' | 'achievements'>('dashboard');
  const [isOnboarded, setIsOnboarded] = useLocalStorage('goal-track-ai-onboarded', false);
  const [isClient, setIsClient] = useState(false);
  const [momentumStreak, setMomentumStreak] = useLocalStorage('goal-track-ai-momentum', 5);
  const [progressHistory, setProgressHistory] = useLocalStorage<ProgressRecord[]>('goal-track-ai-progress-history', []);
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>('goal-track-ai-achievements', initialAchievements);
  const [userStats, setUserStats] = useLocalStorage<UserStats>('goal-track-ai-user-stats', { level: 1, xp: 0 });
  const [showCelebration, setShowCelebration] = useState(false);
  const [notificationSettings, setNotificationSettings] = useLocalStorage<NotificationSettings>('goal-track-ai-notifications', initialNotificationSettings);

  const { toast } = useToast();

  const dailyProgress = useMemo(() => {
    const completedTasks = tasks.filter(t => t.completed).length;
    return tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  }, [tasks]);

  const checkAndUnlockAchievements = useCallback(() => {
    let changed = false;
    const newAchievements = [...achievements];

    const unlock = (id: string) => {
        const achievement = newAchievements.find(a => a.id === id);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            changed = true;
            toast({
                title: '🏆 Achievement Unlocked!',
                description: `You've earned the "${achievement.name}" badge.`,
            });
        }
    };

    if (tasks.some(t => t.completed)) unlock('first-step');
    if (tasks.filter(t => t.completed).length >= 10) unlock('task-master');
    if (dailyProgress === 100) unlock('perfect-day');
    if (momentumStreak >= 7) unlock('momentum-king');
    if (goals.some(g => g.progress === 100)) unlock('goal-getter');

    if (changed) {
        setAchievements(newAchievements);
    }
  }, [achievements, tasks, dailyProgress, momentumStreak, goals, setAchievements, toast]);

  useEffect(() => {
    setIsClient(true);
    checkAndUnlockAchievements();
  }, [checkAndUnlockAchievements]);
  
  const updateProgressHistory = useCallback((newProgress: number, currentTasks: Task[]) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const history = [...progressHistory];
    const todayRecord = history.find(r => r.date === todayStr);
    
    const completedTasks = currentTasks.filter(t => t.completed).length;
    const totalTasks = currentTasks.length;

    if (todayRecord) {
      todayRecord.progress = newProgress;
      todayRecord.completedTasks = completedTasks;
      todayRecord.totalTasks = totalTasks;
    } else {
      history.push({ date: todayStr, progress: newProgress, completedTasks, totalTasks });
    }
    setProgressHistory(history);
  }, [progressHistory, setProgressHistory]);

  const updateGoals = useCallback((currentTasks: Task[]) => {
    const completedTasks = currentTasks.filter(t => t.completed).length;
    const totalTasks = currentTasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    setGoals(prevGoals => prevGoals.map(goal => ({ ...goal, progress })));
    updateProgressHistory(progress, currentTasks);

  }, [setGoals, updateProgressHistory]);

  const handleToggleTask = (id: string) => {
    let wasCompleted = false;
    const newTasks = tasks.map(task => {
        if (task.id === id) {
            wasCompleted = !task.completed;
            return { ...task, completed: !task.completed };
        }
        return task;
    });

    setTasks(newTasks);
    updateGoals(newTasks);

    const newDailyProgress = newTasks.length > 0 ? Math.round((newTasks.filter(t => t.completed).length / newTasks.length) * 100) : 0;
    if (newDailyProgress === 100) {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const todayRecord = progressHistory.find(r => r.date === todayStr);
      if (!todayRecord || todayRecord.progress < 100) {
          setShowCelebration(true);
      }
    }

    if (wasCompleted) {
        setUserStats(prev => {
            const newXp = prev.xp + XP_PER_TASK;
            const xpForNextLevel = LEVEL_UP_BASE_XP * prev.level;
            if (newXp >= xpForNextLevel) {
                toast({ title: '🎉 Level Up!', description: `You've reached Level ${prev.level + 1}!` });
                return { level: prev.level + 1, xp: newXp - xpForNextLevel };
            }
            return { ...prev, xp: newXp };
        });
    }
  };
  
  const handleAddTask = (text: string) => {
    if (text.trim()) {
      const newTask: Task = { id: uuidv4(), text, completed: false };
      const newTasks = [...tasks, newTask];
      setTasks(newTasks);
      updateGoals(newTasks);
    }
  };

  const handleDeleteTask = (id: string) => {
    const newTasks = tasks.filter(task => task.id !== id);
    setTasks(newTasks);
    updateGoals(newTasks);
  };

  const handleAddNewGoal = (newGoalData: { title: string; type: 'weekly' | 'monthly' }) => {
    const newGoal: Goal = {
      id: uuidv4(),
      title: newGoalData.title,
      type: newGoalData.type,
      progress: tasks.length > 0 ? Math.round(tasks.filter(t => t.completed).length / tasks.length * 100) : 0,
    };
    setGoals(prevGoals => [...prevGoals, newGoal]);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };
  
  const handleOnboardingComplete = () => {
    setIsOnboarded(true);
  };

  const handleResetData = () => {
    setTasks(initialTasks);
    setGoals(initialGoals);
    setMomentumStreak(5);
    setAchievements(initialAchievements);
    setProgressHistory([]);
    setUserStats({ level: 1, xp: 0 });
    setNotificationSettings(initialNotificationSettings);
    setIsOnboarded(false);
  };

  const handleUpdateNotificationSettings = (newSettings: Partial<NotificationSettings>) => {
    setNotificationSettings(prev => ({ ...prev, ...newSettings }));
  };

  const renderView = () => {
    switch (activeView) {
      case 'review':
        return <WeeklyReview goals={goals} />;
      case 'settings':
        return <Settings 
                    resetData={handleResetData}
                    notificationSettings={notificationSettings}
                    onSettingsChange={handleUpdateNotificationSettings}
                />;
      case 'progress':
        return <ProgressView history={progressHistory} stats={userStats} />;
      case 'achievements':
        return <AchievementsPage achievements={achievements} />;
      case 'dashboard':
      default:
        return (
          <Dashboard
            tasks={tasks}
            goals={goals}
            momentumStreak={momentumStreak}
            dailyProgress={dailyProgress}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onAddNewGoal={handleAddNewGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        );
    }
  };

  return (
    <>
      {isClient && !isOnboarded && <Onboarding onComplete={handleOnboardingComplete} />}
      {showCelebration && <Celebration onComplete={() => setShowCelebration(false)} />}
      <div className="flex flex-col min-h-screen bg-background">
        <Header activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {isClient ? renderView() : null}
        </main>
      </div>
    </>
  );
}
