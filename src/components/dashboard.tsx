'use client';

import type { Task, Goal } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, TrendingUp, Flame, Plus, Mic, MicOff, Trash2, CalendarCheck, LoaderCircle, BrainCircuit } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { generateGoalImage } from '@/ai/flows/generate-goal-image';
import { useTranslation } from '@/lib/i18n';


interface DashboardProps {
  tasks: Task[];
  goals: Goal[];
  momentumStreak: number;
  dailyProgress: number;
  onToggleTask: (id: string) => void;
  onAddTask: (text: string) => void;
  onDeleteTask: (id: string) => void;
  onAddNewGoal: (goal: { title: string; type: 'weekly' | 'monthly', imageUrl: string }) => void;
  onDeleteGoal: (id: string) => void;
}

export default function Dashboard({ tasks, goals, momentumStreak, dailyProgress, onToggleTask, onAddTask, onDeleteTask, onAddNewGoal, onDeleteGoal }: DashboardProps) {
  const [newTaskText, setNewTaskText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();
  const { t, language } = useTranslation();
  
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalType, setNewGoalType] = useState<'weekly' | 'monthly'>('weekly');
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = language === 'my' ? 'my-MM' : 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      setNewTaskText(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      toast({
        variant: 'destructive',
        title: t('toasts.micError.title'),
        description:
          event.error === 'not-allowed'
            ? t('toasts.micNotAllowed.desc')
            : t('toasts.micError.desc', {error: event.error}),
      });
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
    };
  }, [toast, t, language]);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
        toast({
            variant: 'destructive',
            title: t('toasts.micNotSupported.title'),
            description: t('toasts.micNotSupported.desc'),
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
            title: t('toasts.micStartError.title'),
            description: t('toasts.micStartError.desc'),
        });
      }
    }
  };


  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask(newTaskText);
    setNewTaskText('');
  };

  const handleAddNewGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) {
        toast({
            variant: 'destructive',
            title: t('toasts.goalTitleRequired.title'),
            description: t('toasts.goalTitleRequired.desc'),
        });
        return;
    }
    
    setIsCreatingGoal(true);
    try {
        const { imageUrl } = await generateGoalImage({ goalTitle: newGoalTitle });
        onAddNewGoal({ title: newGoalTitle, type: newGoalType, imageUrl });
        
        setNewGoalTitle('');
        setNewGoalType('weekly');
        setIsAddGoalOpen(false);
    } catch(error) {
        console.error("Error generating goal image", error);
        toast({
            variant: 'destructive',
            title: t('toasts.goalImageError.title'),
            description: t('toasts.goalImageError.desc'),
        });
    } finally {
        setIsCreatingGoal(false);
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
                    <CardTitle>{t('dashboard.tasksTitle')}</CardTitle>
                </div>
                <CardDescription>{t('dashboard.tasksCompleted', {completed: completedTasks, total: tasks.length})}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTaskSubmit} className="mb-4 flex gap-2">
              <Input
                placeholder={t('dashboard.addTaskPlaceholder')}
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
              />
              <Button type="submit" size="icon" aria-label={t('dashboard.addTaskLabel')}><Plus /></Button>
              <Button type="button" size="icon" variant={isRecording ? "destructive" : "outline"} onClick={handleMicClick} aria-label={t('dashboard.recordTaskLabel')}>
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
                    <p className="py-4 text-center text-sm text-muted-foreground">{t('dashboard.noTasks')}</p>
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
                    <CardTitle>{t('dashboard.summaryTitle')}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div>
                    <div className="mb-1 flex items-center justify-between">
                        <p className="text-sm font-medium">{t('dashboard.progressTitle')}</p>
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
                    <CardTitle>{t('dashboard.goalsTitle')}</CardTitle>
                </div>
                <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> {t('dashboard.newGoal')}</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('dashboard.createGoalTitle')}</DialogTitle>
                            <DialogDescription>
                                {t('dashboard.createGoalDesc')}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddNewGoalSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="goal-title">{t('dashboard.goalTitleLabel')}</Label>
                                    <Input 
                                        id="goal-title" 
                                        placeholder={t('dashboard.goalTitlePlaceholder')}
                                        value={newGoalTitle}
                                        onChange={(e) => setNewGoalTitle(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>{t('dashboard.goalTypeLabel')}</Label>
                                    <RadioGroup defaultValue="weekly" value={newGoalType} onValueChange={(value: 'weekly' | 'monthly') => setNewGoalType(value)}>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="weekly" id="r-weekly" />
                                            <Label htmlFor="r-weekly">{t('dashboard.weekly')}</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="monthly" id="r-monthly" />
                                            <Label htmlFor="r-monthly">{t('dashboard.monthly')}</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isCreatingGoal}>
                                  {isCreatingGoal ? (
                                    <>
                                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                      {t('dashboard.creating')}
                                    </>
                                  ) : (
                                    <>
                                      <BrainCircuit className="mr-2 h-4 w-4" />
                                      {t('dashboard.createGoal')}
                                    </>
                                  )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.map((goal) => (
              <Card key={goal.id} className="overflow-hidden">
                {goal.imageUrl && (
                    <div className="aspect-video w-full bg-secondary">
                        <img src={goal.imageUrl} alt={goal.title} data-ai-hint="abstract goal" className="h-full w-full object-cover" />
                    </div>
                )}
                <CardHeader className='pb-2'>
                    <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg flex-1 truncate" title={goal.title}>{goal.title}</CardTitle>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0" onClick={() => onDeleteGoal(goal.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete goal</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-1 flex items-center justify-between">
                        <p className="text-sm font-medium">{t('dashboard.goalProgress')}</p>
                        <p className="text-sm text-muted-foreground">{Math.round(goal.progress)}%</p>
                    </div>
                    <Progress value={goal.progress} aria-label={`${goal.title} progress`} />
                </CardContent>
              </Card>
            ))}
             {goals.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">{t('dashboard.noGoals')}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
             <div className="flex items-center gap-3">
                <Flame className="h-6 w-6 text-accent" />
                <CardTitle>{t('dashboard.momentumTitle')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4 text-center">
                <div>
                    <p className="text-4xl font-bold text-accent">{momentumStreak}</p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.dayStreak')}</p>
                </div>
                <div className="flex gap-1">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className={cn("h-3 w-3 rounded-full", i < (momentumStreak % 8) ? 'bg-accent' : 'bg-muted')}></div>
                    ))}
                </div>
            </div>
            <CardDescription className="mt-4 text-center">{t('dashboard.momentumDesc')}</CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
