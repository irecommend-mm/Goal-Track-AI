'use client';

import type { ProgressRecord, UserStats } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, CalendarDays } from 'lucide-react';
import { format, subDays, eachDayOfInterval, eachMonthOfInterval, getDaysInMonth } from 'date-fns';
import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductivityHeatmap from './productivity-heatmap';
import { useTranslation } from '@/lib/i18n';


interface ProgressViewProps {
  history: ProgressRecord[];
  stats: UserStats;
}

const chartConfig = {
  progress: {
    label: 'Progress',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const LEVEL_UP_BASE_XP = 100;

export default function ProgressView({ history, stats }: ProgressViewProps) {
  const { t } = useTranslation();
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
  
  const monthlyChartData = useMemo(() => {
    const today = new Date();
    const daysInMonth = getDaysInMonth(today);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const days = eachDayOfInterval({ start: monthStart, end: new Date() });

    return days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const record = history.find(h => h.date === dateStr);
        return {
            date: format(day, 'd'), // "1", "2"
            progress: record ? record.progress : 0,
        };
    });
  }, [history]);

  const yearlyChartData = useMemo(() => {
      const today = new Date();
      const yearStart = new Date(today.getFullYear(), 0, 1);
      const months = eachMonthOfInterval({ start: yearStart, end: today });

      return months.map(month => {
          const monthStr = format(month, 'yyyy-MM');
          const recordsInMonth = history.filter(h => h.date.startsWith(monthStr));
          const totalProgress = recordsInMonth.reduce((sum, r) => sum + r.progress, 0);
          const avgProgress = recordsInMonth.length > 0 ? totalProgress / recordsInMonth.length : 0;
          return {
              date: format(month, 'MMM'), // "Jan", "Feb"
              progress: Math.round(avgProgress),
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
                <CardTitle>{t('progress.title')}</CardTitle>
            </div>
            <CardDescription>{t('progress.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <Card>
                <CardHeader>
                    <div className='flex items-center gap-3'>
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl">{t('progress.levelAndXp')}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-lg">{t('progress.level', { level: stats.level })}</p>
                        <p className="text-sm text-muted-foreground">{t('progress.xp', { xp: stats.xp, totalXp: xpForNextLevel })}</p>
                    </div>
                    <Progress value={levelProgress} />
                    <p className="text-xs text-muted-foreground mt-2">{t('progress.xpDesc')}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">{t('progress.chartsTitle')}</CardTitle>
                    <CardDescription>{t('progress.chartsDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="weekly" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="weekly">{t('progress.weekly')}</TabsTrigger>
                            <TabsTrigger value="monthly">{t('progress.monthly')}</TabsTrigger>
                            <TabsTrigger value="yearly">{t('progress.yearly')}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="weekly" className="mt-4">
                            <ChartContainer config={chartConfig} className="h-[200px] w-full">
                                <BarChart accessibilityLayer data={weeklyChartData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis domain={[0, 100]} hide />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="progress" fill="var(--color-progress)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        </TabsContent>
                        <TabsContent value="monthly" className="mt-4">
                            <ChartContainer config={chartConfig} className="h-[200px] w-full">
                                <BarChart accessibilityLayer data={monthlyChartData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis domain={[0, 100]} hide />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="progress" fill="var(--color-progress)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        </TabsContent>
                        <TabsContent value="yearly" className="mt-4">
                            <ChartContainer config={chartConfig} className="h-[200px] w-full">
                                <BarChart accessibilityLayer data={yearlyChartData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis domain={[0, 100]} hide />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="progress" fill="var(--color-progress)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <CalendarDays className="h-6 w-6 text-primary" />
            <CardTitle>{t('progress.heatmapTitle')}</CardTitle>
          </div>
          <CardDescription>{t('progress.heatmapDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
            <ProductivityHeatmap history={history} />
        </CardContent>
      </Card>
    </div>
  );
}
