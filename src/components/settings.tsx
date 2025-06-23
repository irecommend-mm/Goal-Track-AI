'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Brush, Trash2, AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { NotificationSettings } from '@/lib/types';
import { useTheme, themes } from './theme-provider';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface SettingsProps {
    resetData: () => void;
    notificationSettings: NotificationSettings;
    onSettingsChange: (newSettings: Partial<NotificationSettings>) => void;
}

export default function Settings({ resetData, notificationSettings, onSettingsChange }: SettingsProps) {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleDailyReminderChange = async (checked: boolean) => {
    onSettingsChange({ dailyReminders: checked });
    if (checked && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'denied') {
            toast({
                variant: 'destructive',
                title: 'Permission Denied',
                description: 'You have blocked notifications. Please enable them in your browser settings to receive reminders.',
            });
            onSettingsChange({ dailyReminders: false });
        }
      } else if (Notification.permission === 'denied') {
          toast({
                variant: 'destructive',
                title: 'Permission Denied',
                description: 'You have blocked notifications. Please enable them in your browser settings to receive reminders.',
            });
            onSettingsChange({ dailyReminders: false });
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
            <div className='flex items-center gap-3'>
                <Brush className="h-6 w-6 text-primary" />
                <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>Customize the look and feel of the app.</CardDescription>
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
                    <span className="text-sm font-medium">{t.label}</span>
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
            <div className='flex items-center gap-3'>
                <Bell className="h-6 w-6 text-primary" />
                <CardTitle>System Notifications</CardTitle>
            </div>
            <CardDescription>Manage browser-level notification preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Daily Reminders</p>
              <p className="text-sm text-muted-foreground">
                Get a push notification in the evening for incomplete tasks.
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
                  <AlertTitle>Notifications Blocked</AlertTitle>
                  <AlertDescription>
                      You have blocked notifications. To enable reminders, please update your browser settings.
                  </AlertDescription>
              </Alert>
           )}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Weekly Review Reminder</p>
              <p className="text-sm text-muted-foreground">
                Get a reminder at the end of each week.
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
                <CardTitle>Data Management</CardTitle>
            </div>
            <CardDescription>Manage your application data.</CardDescription>
        </CardHeader>
        <CardContent>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">Reset All Data</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all your tasks and goals data from this device.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={resetData}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <p className="mt-2 text-sm text-muted-foreground">
                This will reset all tasks and goals to their initial state.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
