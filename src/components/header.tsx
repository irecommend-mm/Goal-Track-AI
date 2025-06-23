'use client';

import { Target, LayoutDashboard, Star, Settings as SettingsIcon, BarChart3, Award, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDistanceToNow } from 'date-fns';
import type { AppNotification } from '@/lib/types';


interface HeaderProps {
  activeView: 'dashboard' | 'review' | 'settings' | 'progress' | 'achievements';
  setActiveView: (view: 'dashboard' | 'review' | 'settings' | 'progress' | 'achievements') => void;
  notifications: AppNotification[];
  onMarkNotificationsAsRead: () => void;
}

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'review', label: 'Weekly Review', icon: Star },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
] as const;


export default function Header({ activeView, setActiveView, notifications, onMarkNotificationsAsRead }: HeaderProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Target className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Goal Track AI</h1>
        </div>
        <div className="flex items-center gap-2">
          <nav className="hidden items-center space-x-2 md:flex">
            {navItems.map((item) => (
              <Button
                  key={item.id}
                  variant={activeView === item.id ? 'default' : 'ghost'}
                  onClick={() => setActiveView(item.id)}
                  className="gap-2"
              >
                  <item.icon className="h-4 w-4" />
                  {item.label}
              </Button>
            ))}
          </nav>

          <Popover onOpenChange={(open) => { if (open) onMarkNotificationsAsRead() }}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-2.5 w-2.5 items-center justify-center">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
                        </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Recent updates and achievements.
                    </p>
                  </div>
                  <div className="grid max-h-80 gap-2 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className="grid grid-cols-[25px_1fr] items-start pb-4 last:pb-0">
                          <span className={cn(
                            "flex h-2 w-2 translate-y-1.5 rounded-full",
                             n.read ? "bg-muted-foreground/50" : "bg-primary"
                          )} />
                          <div className="grid gap-1">
                            <p className="text-sm font-medium">{n.message}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-sm text-muted-foreground py-4">No new notifications</p>
                    )}
                  </div>
              </div>
            </PopoverContent>
          </Popover>

          <nav className="flex items-center space-x-1 md:hidden">
            <TooltipProvider>
              {navItems.map((item) => (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeView === item.id ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setActiveView(item.id)}
                      aria-label={item.label}
                    >
                      <item.icon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </nav>
        </div>
      </div>
    </header>
  );
}
