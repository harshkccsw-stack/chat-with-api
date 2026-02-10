'use client';

import { Message } from '@/types/chat';
import React from 'react';
import { ChatMessage } from './ChatMessage';

interface MessageListProps {
  messages: Message[];
  onEditMessage?: (messageId: string, content: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onRegenerateMessage?: (messageId: string) => void;
}

export function MessageList({ messages, onEditMessage, onDeleteMessage, onRegenerateMessage }: MessageListProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <div className="relative mx-auto w-16 h-16 mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 rounded-2xl blur-lg opacity-30" />
            <div className="relative w-full h-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-2xl flex items-center justify-center border border-violet-500/20">
              <span className="text-2xl">💬</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2 gradient-text">Start a conversation</h2>
          <p className="text-sm">Send a message to begin chatting with AI Studio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          onEdit={onEditMessage ? (content) => onEditMessage(message.id, content) : undefined}
          onDelete={onDeleteMessage ? () => onDeleteMessage(message.id) : undefined}
          onRegenerate={onRegenerateMessage ? () => onRegenerateMessage(message.id) : undefined}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
