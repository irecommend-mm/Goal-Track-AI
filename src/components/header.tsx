'use client';

import { Target, LayoutDashboard, Star, Settings as SettingsIcon, BarChart3, Bell, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import type { AppNotification } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';


interface HeaderProps {
  activeView: 'dashboard' | 'review' | 'settings' | 'progress';
  setActiveView: (view: 'dashboard' | 'review' | 'settings' | 'progress') => void;
  notifications: AppNotification[];
  onMarkNotificationsAsRead: () => void;
}

export default function Header({ activeView, setActiveView, notifications, onMarkNotificationsAsRead }: HeaderProps) {
  const { t, setLanguage } = useTranslation();

  const navItems = [
    { id: 'dashboard', label: t('header.nav.dashboard'), icon: LayoutDashboard },
    { id: 'progress', label: t('header.nav.progress'), icon: BarChart3 },
    { id: 'review', label: t('header.nav.review'), icon: Star },
    { id: 'settings', label: t('header.nav.settings'), icon: SettingsIcon },
] as const;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Target className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold text-foreground">{t('header.title')}</h1>
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Languages className="h-5 w-5" />
                    <span className="sr-only">{t('header.language')}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                    English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('my')}>
                    မြန်မာ
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
                    <span className="sr-only">{t('header.notifications.title')}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">{t('header.notifications.title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('header.notifications.description')}
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
                      <p className="text-center text-sm text-muted-foreground py-4">{t('header.notifications.empty')}</p>
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
