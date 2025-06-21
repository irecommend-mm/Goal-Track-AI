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
  { id: 'g1', title: 'Weekly Fitness Goal', progress: 50, type: 'weekly' },
  { id: 'g2', title: 'Monthly Learning Goal', progress: 50, type: 'monthly' },
];

export default function Home() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('goal-track-ai-tasks', initialTasks);
  const [goals, setGoals] = useLocalStorage<Goal[]>('goal-track-ai-goals', initialGoals);
  const [activeView, setActiveView] = useState<'dashboard' | 'review' | 'settings'>('dashboard');
  const [isOnboarded, setIsOnboarded] = useLocalStorage('goal-track-ai-onboarded', false);
  const [isClient, setIsClient] = useState(false);
  const [momentumStreak, setMomentumStreak] = useLocalStorage('goal-track-ai-momentum', 5);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    // This ensures that we don't try to render the onboarding UI on the server
    // or before we've had a chance to check localStorage.
    setIsClient(true);
  }, []);

  const updateGoals = useCallback((currentTasks: Task[]) => {
    const completedTasks = currentTasks.filter(t => t.completed).length;
    const totalTasks = currentTasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    setGoals(prevGoals => prevGoals.map(goal => ({ ...goal, progress })));
  }, [setGoals]);

  const handleToggleTask = (id: string) => {
    const newTasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(newTasks);
    updateGoals(newTasks);
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
      <div className="flex flex-col min-h-screen bg-background">
        <Header activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {renderView()}
        </main>
      </div>
    </>
  );
}
