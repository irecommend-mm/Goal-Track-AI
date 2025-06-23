'use client';
import type { Achievement } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementsPageProps {
  achievements: Achievement[];
}

export default function AchievementsPage({ achievements }: AchievementsPageProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Award className="h-6 w-6 text-primary" />
            <CardTitle>Achievements</CardTitle>
          </div>
          <CardDescription>
            You've unlocked {unlockedCount} of {totalCount} badges. Keep up the great work!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {achievements.map((ach) => {
              const Icon = ach.icon;
              return (
                <div
                  key={ach.id}
                  className={cn(
                    'relative overflow-hidden rounded-lg border p-5 text-center transition-all transform hover:scale-105',
                    ach.unlocked
                      ? 'border-accent/50 bg-card shadow-lg'
                      : 'bg-muted/50 text-muted-foreground'
                  )}
                >
                  {ach.unlocked && (
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-primary/20 opacity-50"></div>
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <div
                      className={cn(
                        'flex h-16 w-16 items-center justify-center rounded-full',
                        ach.unlocked
                          ? 'bg-accent text-accent-foreground shadow-md'
                          : 'bg-muted-foreground/20'
                      )}
                    >
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-lg font-bold">{ach.name}</p>
                      <p className="text-sm">{ach.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
