'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/store/chatStore';
import { Menu, Sparkles, X } from 'lucide-react';
import React from 'react';
import { ConversationList } from './ConversationList';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(true);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const {
    conversations,
    currentConversationId,
    createConversation,
    setCurrentConversation,
    deleteConversation,
  } = useChatStore();

  const handleNewConversation = () => {
    const id = createConversation();
    setCurrentConversation(id);
    setIsMobileOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversation(id);
    setIsMobileOpen(false);
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed md:relative inset-y-0 left-0 z-40 w-72 glass border-r flex flex-col transition-transform',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          className
        )}
      >
        {/* Gradient accent line */}
        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-violet-500/50 via-fuchsia-500/30 to-transparent" />
        
        <div className="p-4">
          <Button 
            onClick={handleNewConversation} 
            className="w-full gradient-bg hover:opacity-90 transition-opacity glow-sm" 
            size="sm"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <ConversationList
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={handleDeleteConversation}
          />
        </div>
      </div>
    </>
  );
}
