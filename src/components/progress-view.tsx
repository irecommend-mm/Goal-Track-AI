'use client';

import type { ProgressRecord, Achievement, UserStats } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from 'recharts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Award, BarChart3, TrendingUp } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface ProgressViewProps {
  history: ProgressRecord[];
  achievements: Achievement[];
  stats: UserStats;
}

const chartConfig = {
  progress: {
    label: 'Progress',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const LEVEL_UP_BASE_XP = 100;

export default function ProgressView({ history, achievements, stats }: ProgressViewProps) {

  const weeklyChartData = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    return last7Days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const record = history.find(h => h.date === dateStr);
      return {
        date: format(day, 'EEE'), // "Mon", "Tue"
        progress: record ? record.progress : 0,
      };
    });
  }, [history]);
  
  const xpForNextLevel = LEVEL_UP_BASE_XP * stats.level;
  const levelProgress = xpForNextLevel > 0 ? (stats.xp / xpForNextLevel) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <div className='flex items-center gap-3'>
                <BarChart3 className="h-6 w-6 text-primary" />
                <CardTitle>Your Progress</CardTitle>
            </div>
            <CardDescription>Visualize your accomplishments and growth over time.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
            <Card>
                <CardHeader>
                    <div className='flex items-center gap-3'>
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl">Level & XP</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-lg">Level {stats.level}</p>
                        <p className="text-sm text-muted-foreground">{stats.xp} / {xpForNextLevel} XP</p>
                    </div>
                    <Progress value={levelProgress} />
                    <p className="text-xs text-muted-foreground mt-2">Complete tasks to earn XP and level up!</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Weekly Snapshot</CardTitle>
                    <CardDescription>Daily progress over the last 7 days.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[150px] w-full">
                        <BarChart accessibilityLayer data={weeklyChartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis domain={[0, 100]} hide />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="progress" fill="var(--color-progress)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <Award className="h-6 w-6 text-primary" />
            <CardTitle>Achievements</CardTitle>
          </div>
          <CardDescription>Badges you've earned on your journey.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {achievements.map((ach) => {
              const Icon = ach.icon;
              return (
              <TooltipProvider key={ach.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn(
                        "flex flex-col items-center justify-center gap-2 rounded-lg border p-4 text-center transition-all",
                        ach.unlocked ? 'border-accent/80 bg-accent/10' : 'bg-muted/50'
                    )}>
                      <div className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-full",
                          ach.unlocked ? 'bg-accent text-accent-foreground' : 'bg-muted-foreground/20 text-muted-foreground'
                      )}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <p className={cn(
                          "text-sm font-semibold",
                          !ach.unlocked && 'text-muted-foreground'
                      )}>{ach.name}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{ach.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )})}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
