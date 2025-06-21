'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Task, Goal } from '@/lib/types';
import useLocalStorage from '@/hooks/use-local-storage';
import Header from '@/components/header';
import Onboarding from '@/components/onboarding';
import Dashboard from '@/components/dashboard';
import WeeklyReview from '@/components/weekly-review';
import Settings from '@/components/settings';
import { v4 as uuidv4 } from 'uuid';

const initialTasks: Task[] = [
  { id: '1', text: 'Complete project proposal', completed: false },
  { id: '2', text: 'Workout for 30 minutes', completed: true },
  { id: '3', text: 'Read 1 chapter of a book', completed: false },
  { id: '4', text: 'Meditate for 10 minutes', completed: true },
];

const initialGoals: Goal[] = [
  { id: 'g1', title: 'Weekly Fitness Goal', progress: 60, type: 'weekly' },
  { id: 'g2', title: 'Monthly Learning Goal', progress: 45, type: 'monthly' },
];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [activeView, setActiveView] = useState<'dashboard' | 'review' | 'settings'>('dashboard');
  const [isOnboarded, setIsOnboarded] = useLocalStorage('goal-track-ai-onboarded', false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [momentumStreak, setMomentumStreak] = useState(5);

  useEffect(() => {
    // Only show onboarding on the client-side after checking local storage
    setShowOnboarding(!isOnboarded);
  }, [isOnboarded]);

  const handleToggleTask = (id: string) => {
    const newTasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(newTasks);
    updateGoals(newTasks);
  };
  
  const handleAddTask = (text: string) => {
    if (text.trim()) {
      const newTask = { id: uuidv4(), text, completed: false };
      setTasks(prevTasks => [...prevTasks, newTask]);
    }
  };

  const updateGoals = useCallback((currentTasks: Task[]) => {
    const completedTasks = currentTasks.filter(t => t.completed).length;
    const totalTasks = currentTasks.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    setGoals(prevGoals => prevGoals.map(goal => {
      if(goal.type === 'weekly') {
        return {...goal, progress: Math.min(100, progress + 20)} // Mocking some base progress
      }
      if(goal.type === 'monthly') {
        return {...goal, progress: Math.min(100, progress)} // Mocking some base progress
      }
      return goal;
    }));

  }, []);
  
  const handleOnboardingComplete = () => {
    setIsOnboarded(true);
    setShowOnboarding(false);
  };

  const handleResetData = () => {
    setTasks(initialTasks);
    setGoals(initialGoals);
    setMomentumStreak(5);
  };

  const renderView = () => {
    switch (activeView) {
      case 'review':
        return <WeeklyReview goals={goals} />;
      case 'settings':
        return <Settings resetData={handleResetData} />;
      case 'dashboard':
      default:
        return (
          <Dashboard
            tasks={tasks}
            goals={goals}
            momentumStreak={momentumStreak}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
          />
        );
    }
  };

  return (
    <>
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      <div className="flex flex-col min-h-screen bg-background">
        <Header activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {renderView()}
        </main>
      </div>
    </>
  );
}
