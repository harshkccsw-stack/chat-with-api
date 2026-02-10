'use client';

import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/store/settingsStore';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useSettingsStore();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl hover:bg-violet-500/10 transition-colors">
      {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-violet-500" />}
    </Button>
  );
}
