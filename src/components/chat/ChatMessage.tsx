'use client';

import { Button } from '@/components/ui/button';
import { copyToClipboard, formatTimestamp } from '@/lib/utils';
import { Message } from '@/types/chat';
import { Bot, Check, Copy, Edit2, RefreshCw, Trash2, User } from 'lucide-react';
import NextImage from 'next/image';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: Message;
  onEdit?: (content: string) => void;
  onDelete?: () => void;
  onRegenerate?: () => void;
}

export function ChatMessage({ message, onEdit, onDelete, onRegenerate }: ChatMessageProps) {
  const [copied, setCopied] = React.useState(false);
  const [codeCopied, setCodeCopied] = React.useState<string | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(message.content);

  const handleCopy = async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCodeCopy = async (code: string, key: string) => {
    const success = await copyToClipboard(code);
    if (success) {
      setCodeCopied(key);
      setTimeout(() => setCodeCopied(null), 2000);
    }
  };

  const handleSaveEdit = () => {
    if (onEdit && editContent.trim()) {
      onEdit(editContent);
      setIsEditing(false);
    }
  };

  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 p-5 ${isUser ? 'bg-gradient-to-r from-violet-500/5 via-fuchsia-500/5 to-transparent' : ''}`}>
      <div className="flex-shrink-0">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${
          isUser 
            ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500' 
            : 'bg-gradient-to-br from-cyan-500 to-blue-500'
        }`}>
          {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className={`font-semibold text-sm ${isUser ? 'gradient-text' : 'text-cyan-500'}`}>
            {isUser ? 'You' : 'AI Studio'}
          </span>
          <span className="text-xs text-muted-foreground">{formatTimestamp(message.timestamp)}</span>
          {message.model && (
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {message.model}
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[100px] p-2 border rounded-md bg-background"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const code = String(children).replace(/\n$/, '');
                  const key = `${message.id}-${code.slice(0, 20)}`;

                  return !inline && match ? (
                    <div className="relative group">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleCodeCopy(code, key)}
                      >
                        {codeCopied === key ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {code}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>

            {/* Display generated images */}
            {message.images && message.images.length > 0 && (
              <div className="mt-4 space-y-2">
                {message.images.map((imageUrl, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden border">
                    <NextImage
                      src={imageUrl}
                      alt={`Generated image ${index + 1}`}
                      width={1024}
                      height={1024}
                      className="w-full h-auto"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-1 mt-2">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCopy}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
          {isUser && onEdit && (
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsEditing(true)}>
              <Edit2 className="w-3 h-3" />
            </Button>
          )}
          {!isUser && onRegenerate && (
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onRegenerate}>
              <RefreshCw className="w-3 h-3" />
            </Button>
          )}
          {onDelete && (
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onDelete}>
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
