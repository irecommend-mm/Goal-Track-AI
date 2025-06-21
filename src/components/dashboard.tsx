'use client';

import type { Task, Goal } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, TrendingUp, Flame, Plus, Mic, MicOff, Trash2, CalendarCheck } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


interface DashboardProps {
  tasks: Task[];
  goals: Goal[];
  momentumStreak: number;
  dailyProgress: number;
  onToggleTask: (id: string) => void;
  onAddTask: (text: string) => void;
  onDeleteTask: (id: string) => void;
  onAddNewGoal: (goal: { title: string; type: 'weekly' | 'monthly' }) => void;
  onDeleteGoal: (id: string) => void;
}

export default function Dashboard({ tasks, goals, momentumStreak, dailyProgress, onToggleTask, onAddTask, onDeleteTask, onAddNewGoal, onDeleteGoal }: DashboardProps) {
  const [newTaskText, setNewTaskText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();
  
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalType, setNewGoalType] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
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
        toast({
            variant: 'destructive',
            title: 'Browser Not Supported',
            description: 'Speech recognition is not available in your browser.',
        });
        return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
          console.error("Could not start recognition", error)
           toast({
            variant: 'destructive',
            title: 'Could not start recording',
            description: 'Please check your microphone permissions and try again.',
        });
      }
    }
  };


  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask(newTaskText);
    setNewTaskText('');
  };

  const handleAddNewGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoalTitle.trim()) {
      onAddNewGoal({ title: newGoalTitle, type: newGoalType });
      setNewGoalTitle('');
      setNewGoalType('weekly');
      setIsAddGoalOpen(false);
    } else {
        toast({
            variant: 'destructive',
            title: 'Goal Title Required',
            description: 'Please enter a title for your goal.',
        });
    }
  };

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
                    aria-labelledby={`task-label-${task.id}`}
                  />
                  <label
                    id={`task-label-${task.id}`}
                    className={cn(
                      'flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                      task.completed && 'text-muted-foreground line-through'
                    )}
                  >
                    {task.text}
                  </label>
                  <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => onDeleteTask(task.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete task</span>
                  </Button>
                </div>
              ))}
                {tasks.length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">No tasks for today. Add one to get started!</p>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <CalendarCheck className="h-6 w-6 text-primary" />
                    <CardTitle>Daily Summary</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div>
                    <div className="mb-1 flex items-center justify-between">
                        <p className="text-sm font-medium">Today's Progress</p>
                        <p className="text-sm text-muted-foreground">{dailyProgress}%</p>
                    </div>
                    <Progress value={dailyProgress} aria-label="Daily task progress" />
                </div>
            </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <CardTitle>Goal Progress</CardTitle>
                </div>
                <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create a New Goal</DialogTitle>
                            <DialogDescription>
                                What new ambition do you want to conquer? Define it here.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddNewGoalSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="goal-title">Goal Title</Label>
                                    <Input 
                                        id="goal-title" 
                                        placeholder="e.g., Run a 5k marathon" 
                                        value={newGoalTitle}
                                        onChange={(e) => setNewGoalTitle(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Goal Type</Label>
                                    <RadioGroup defaultValue="weekly" value={newGoalType} onValueChange={(value: 'weekly' | 'monthly') => setNewGoalType(value)}>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="weekly" id="r-weekly" />
                                            <Label htmlFor="r-weekly">Weekly</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="monthly" id="r-monthly" />
                                            <Label htmlFor="r-monthly">Monthly</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Goal</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium flex-1 truncate" title={goal.title}>{goal.title}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    <p className="text-sm text-muted-foreground">{Math.round(goal.progress)}%</p>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDeleteGoal(goal.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete goal</span>
                    </Button>
                  </div>
                </div>
                <Progress value={goal.progress} aria-label={`${goal.title} progress`} />
              </div>
            ))}
             {goals.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">No goals yet. Add one to get started!</p>
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
                        <div key={i} className={cn("h-3 w-3 rounded-full", i < (momentumStreak % 8) ? 'bg-accent' : 'bg-muted')}></div>
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
