'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Brush, Trash2, AlertTriangle, Award } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { NotificationSettings, Achievement } from '@/lib/types';
import { useTheme, themes } from './theme-provider';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface SettingsProps {
    resetData: () => void;
    notificationSettings: NotificationSettings;
    onSettingsChange: (newSettings: Partial<NotificationSettings>) => void;
    achievements: Achievement[];
}

export default function Settings({ resetData, notificationSettings, onSettingsChange, achievements }: SettingsProps) {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleDailyReminderChange = async (checked: boolean) => {
    onSettingsChange({ dailyReminders: checked });
    if (checked && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'denied') {
            toast({
                variant: 'destructive',
                title: t('toasts.notificationPermissionDenied.title'),
                description: t('toasts.notificationPermissionDenied.desc'),
            });
            onSettingsChange({ dailyReminders: false });
        }
      } else if (Notification.permission === 'denied') {
          toast({
                variant: 'destructive',
                title: t('toasts.notificationPermissionDenied.title'),
                description: t('toasts.notificationPermissionDenied.desc'),
            });
            onSettingsChange({ dailyReminders: false });
      }
    }
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
            <div className='flex items-center gap-3'>
                <Brush className="h-6 w-6 text-primary" />
                <CardTitle>{t('settings.appearanceTitle')}</CardTitle>
            </div>
            <CardDescription>{t('settings.appearanceDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {themes.map((t) => (
                <div key={t.name} className="flex flex-col items-center gap-2">
                    <Button
                        variant={theme === t.name ? 'default' : 'outline'}
                        onClick={() => setTheme(t.name)}
                        className={`h-16 w-16 rounded-full border-2 ${theme === t.name ? 'border-ring' : 'border-transparent'}`}
                    >
                        <div className={`h-10 w-10 rounded-full ${t.name}-preview`}></div>
                    </Button>
                    <span className="text-sm font-medium">{t(`settings.themes.${t.label.toLowerCase()}`)}</span>
                </div>
            ))}
            <style jsx>{`
                .theme-default-preview { background-color: hsl(218 91% 65%); }
                .theme-forest-preview { background-color: hsl(140 40% 45%); }
                .theme-ocean-preview { background-color: hsl(210 80% 55%); }
                .theme-sunset-preview { background-color: hsl(30 90% 60%); }
            `}</style>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Award className="h-6 w-6 text-primary" />
            <CardTitle>{t('settings.achievementsTitle')}</CardTitle>
          </div>
          <CardDescription>
            {t('settings.achievementsDesc', { unlockedCount, totalCount })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <Card>
        <CardHeader>
            <div className='flex items-center gap-3'>
                <Bell className="h-6 w-6 text-primary" />
                <CardTitle>{t('settings.notificationsTitle')}</CardTitle>
            </div>
            <CardDescription>{t('settings.notificationsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">{t('settings.dailyReminders')}</p>
              <p className="text-sm text-muted-foreground">
                {t('settings.dailyRemindersDesc')}
              </p>
            </div>
            <Switch
                checked={notificationSettings.dailyReminders}
                onCheckedChange={handleDailyReminderChange}
                aria-label="Toggle daily reminders"
            />
          </div>
           {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'denied' && (
              <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t('settings.notificationsBlockedTitle')}</AlertTitle>
                  <AlertDescription>
                      {t('settings.notificationsBlockedDesc')}
                  </AlertDescription>
              </Alert>
           )}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">{t('settings.weeklyReviewReminders')}</p>
              <p className="text-sm text-muted-foreground">
                {t('settings.weeklyReviewRemindersDesc')}
              </p>
            </div>
            <Switch
                checked={notificationSettings.weeklyReviewReminders}
                onCheckedChange={(checked) => onSettingsChange({ weeklyReviewReminders: checked })}
                aria-label="Toggle weekly review reminders"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <div className='flex items-center gap-3'>
                <Trash2 className="h-6 w-6 text-destructive" />
                <CardTitle>{t('settings.dataManagementTitle')}</CardTitle>
            </div>
            <CardDescription>{t('settings.dataManagementDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">{t('settings.resetData')}</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>{t('settings.resetConfirmationTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('settings.resetConfirmationDesc')}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>{t('settings.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={resetData}>{t('settings.continue')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <p className="mt-2 text-sm text-muted-foreground">
                {t('settings.resetDataDesc')}
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
