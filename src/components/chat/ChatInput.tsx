'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CHAT_MODELS } from '@/lib/constants';
import { useSettingsStore } from '@/store/settingsStore';
import { Send, Square } from 'lucide-react';
import React from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isGenerating?: boolean;
  onStop?: () => void;
  currentModel?: string;
  onModelChange?: (model: string) => void;
}

export function ChatInput({ 
  onSend, 
  disabled, 
  placeholder, 
  isGenerating, 
  onStop,
  currentModel,
  onModelChange,
}: ChatInputProps) {
  const [input, setInput] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const { apiKeys } = useSettingsStore();

  // Get available models based on API keys
  const availableChatModels = CHAT_MODELS.filter(m => {
    if (m.provider === 'openai') return !!apiKeys.openai;
    if (m.provider === 'gemini') return !!apiKeys.gemini;
    if (m.provider === 'claude') return !!apiKeys.claude;
    return false;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 150);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t glass p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-3 items-end">
          {/* Model selector inline */}
          {currentModel && onModelChange && (
            <Select value={currentModel} onValueChange={onModelChange}>
              <SelectTrigger className="w-[140px] h-10 text-xs shrink-0 glass border-border/50 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass border-border/50">
                {availableChatModels.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <div className="flex-1 relative group">
            {/* Gradient border effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/20 via-fuchsia-500/20 to-cyan-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300" />
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || 'Message AI Studio...'}
                disabled={disabled}
                className="min-h-[44px] max-h-[150px] resize-none pr-12 py-3 rounded-xl glass border-border/50 focus:border-violet-500/50 transition-colors"
                rows={1}
              />
              <div className="absolute right-2 bottom-2">
                {isGenerating && onStop ? (
                  <Button type="button" onClick={onStop} variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive">
                    <Square className="w-4 h-4" />
                  </Button>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          type="submit" 
                          disabled={disabled || !input.trim()} 
                          size="icon" 
                          className="h-8 w-8 rounded-lg gradient-bg hover:opacity-90 transition-opacity disabled:opacity-30"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Send message</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
