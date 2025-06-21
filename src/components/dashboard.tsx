'use client';

import type { Task, Goal } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, TrendingUp, Flame, Plus, Mic, MicOff } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface DashboardProps {
  tasks: Task[];
  goals: Goal[];
  momentumStreak: number;
  onToggleTask: (id: string) => void;
  onAddTask: (text: string) => void;
}

export default function Dashboard({ tasks, goals, momentumStreak, onToggleTask, onAddTask }: DashboardProps) {
  const [newTaskText, setNewTaskText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        variant: 'destructive',
        title: 'Browser Not Supported',
        description: 'Speech recognition is not available in your browser.',
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      setNewTaskText(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      toast({
        variant: 'destructive',
        title: 'Speech Recognition Error',
        description:
          event.error === 'not-allowed'
            ? 'Microphone access denied. Please allow it in your browser settings.'
            : `An error occurred: ${event.error}`,
      });
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
    };
  }, [toast]);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };


  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask(newTaskText);
    setNewTaskText('');
  };

  const weeklyGoal = goals.find(g => g.type === 'weekly');
  const monthlyGoal = goals.find(g => g.type === 'monthly');
  const completedTasks = tasks.filter(t => t.completed).length;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                    <CardTitle>Today's Tasks</CardTitle>
                </div>
                <CardDescription>{completedTasks}/{tasks.length} completed</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTaskSubmit} className="mb-4 flex gap-2">
              <Input
                placeholder="Add a new task or use the mic..."
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
              />
              <Button type="submit" size="icon" aria-label="Add task"><Plus /></Button>
              <Button type="button" size="icon" variant={isRecording ? "destructive" : "outline"} onClick={handleMicClick} aria-label="Record task by voice">
                {isRecording ? <MicOff /> : <Mic />}
              </Button>
            </form>
            <div className="space-y-3">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 rounded-md bg-secondary/50 p-3 transition-all hover:bg-secondary">
                  <Checkbox
                    id={task.id}
                    checked={task.completed}
                    onCheckedChange={() => onToggleTask(task.id)}
                  />
                  <label
                    htmlFor={task.id}
                    className={cn(
                      'flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                      task.completed && 'text-muted-foreground line-through'
                    )}
                  >
                    {task.text}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-primary" />
                <CardTitle>Goal Progress</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {weeklyGoal && (
              <div>
                <div className="mb-1 flex justify-between">
                  <p className="text-sm font-medium">{weeklyGoal.title}</p>
                  <p className="text-sm text-muted-foreground">{Math.round(weeklyGoal.progress)}%</p>
                </div>
                <Progress value={weeklyGoal.progress} />
              </div>
            )}
            {monthlyGoal && (
              <div>
                <div className="mb-1 flex justify-between">
                  <p className="text-sm font-medium">{monthlyGoal.title}</p>
                  <p className="text-sm text-muted-foreground">{Math.round(monthlyGoal.progress)}%</p>
                </div>
                <Progress value={monthlyGoal.progress} />
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
             <div className="flex items-center gap-3">
                <Flame className="h-6 w-6 text-accent" />
                <CardTitle>Momentum</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4 text-center">
                <div>
                    <p className="text-4xl font-bold text-accent">{momentumStreak}</p>
                    <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
                <div className="flex gap-1">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className={cn("h-3 w-3 rounded-full", i < momentumStreak ? 'bg-accent' : 'bg-muted')}></div>
                    ))}
                </div>
            </div>
            <CardDescription className="mt-4 text-center">Keep it up to build a strong habit!</CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
