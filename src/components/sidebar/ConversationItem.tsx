'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatTimestamp, truncate } from '@/lib/utils';
import { Conversation } from '@/types/chat';
import { MessageSquare, MoreVertical, Trash2 } from 'lucide-react';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export function ConversationItem({ conversation, isActive, onClick, onDelete }: ConversationItemProps) {
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const preview = lastMessage ? truncate(lastMessage.content, 60) : 'No messages yet';

  return (
    <div
      className={`relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
        isActive 
          ? 'bg-gradient-to-r from-violet-500/20 via-fuchsia-500/10 to-transparent border border-violet-500/30 glow-sm' 
          : 'hover:bg-muted/50 border border-transparent hover:border-border'
      }`}
      onClick={onClick}
    >
      <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
        isActive 
          ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500' 
          : 'bg-muted'
      }`}>
        <MessageSquare className={`w-4 h-4 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-sm truncate ${isActive ? 'gradient-text' : ''}`}>
          {conversation.title}
        </div>
        <div className="text-xs text-muted-foreground truncate mt-0.5">{preview}</div>
        <div className="text-[10px] text-muted-foreground/70 mt-1">{formatTimestamp(conversation.updatedAt)}</div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="glass border-border/50">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-destructive focus:text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
