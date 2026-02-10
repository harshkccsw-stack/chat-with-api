'use client';

import { SettingsModal } from '@/components/settings/SettingsModal';
import { Sparkles } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="relative border-b bg-gradient-to-r from-background via-background to-background overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-cyan-500/10 animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="container relative mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo with gradient background */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 rounded-xl blur opacity-40 group-hover:opacity-75 transition duration-500" />
            <div className="relative flex items-center justify-center w-9 h-9 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-500 rounded-xl shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          
          {/* Brand name with gradient text */}
          <div className="flex flex-col">
            <h1 className="text-lg font-bold bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
              AI Studio
            </h1>
            <span className="text-[10px] text-muted-foreground -mt-0.5 tracking-wide">
              Chat & Image Generation
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <SettingsModal />
        </div>
      </div>
    </header>
  );
}
