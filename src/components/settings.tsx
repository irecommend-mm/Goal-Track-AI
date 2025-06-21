'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


interface SettingsProps {
    resetData: () => void;
}

export default function Settings({ resetData }: SettingsProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
            <div className='flex items-center gap-3'>
                <Bell className="h-6 w-6 text-primary" />
                <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Manage your notification preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Daily Reminders</p>
              <p className="text-sm text-muted-foreground">
                Get a push notification every morning.
              </p>
            </div>
            <Switch defaultChecked/>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Weekly Review Reminder</p>
              <p className="text-sm text-muted-foreground">
                Get a reminder at the end of each week.
              </p>
            </div>
            <Switch defaultChecked/>
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
