'use client';

import { Target, LayoutDashboard, Star, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  activeView: 'dashboard' | 'review' | 'settings';
  setActiveView: (view: 'dashboard' | 'review' | 'settings') => void;
}

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'review', label: 'Weekly Review', icon: Star },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
] as const;


export default function Header({ activeView, setActiveView }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Target className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Goal Track AI</h1>
        </div>
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
        <div className="md:hidden">
            <select
                className="w-full rounded-md border-input bg-background p-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={activeView}
                onChange={(e) => setActiveView(e.target.value as 'dashboard' | 'review' | 'settings')}
                aria-label="Select view"
            >
                {navItems.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                ))}
            </select>
        </div>
      </div>
    </header>
  );
}
