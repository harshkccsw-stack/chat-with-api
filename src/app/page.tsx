'use client';

import { ChatContainer } from '@/components/chat/ChatContainer';
import { ImageGenerator } from '@/components/images/ImageGenerator';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChatStore } from '@/store/chatStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Image as ImageIcon, MessageSquare, Sparkles } from 'lucide-react';
import React from 'react';

export default function Home() {
  const { createConversation, setCurrentConversation, conversations } = useChatStore();
  const { apiKeys } = useSettingsStore();

  // Check if any API key is set
  const hasApiKey = apiKeys.openai || apiKeys.gemini || apiKeys.claude;

  React.useEffect(() => {
    // Create initial conversation if none exist
    if (conversations.length === 0) {
      const id = createConversation();
      setCurrentConversation(id);
    }
  }, [conversations.length, createConversation, setCurrentConversation]);

  if (!hasApiKey) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md p-8">
            {/* Decorative element */}
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 rounded-2xl blur-xl opacity-50" />
              <div className="relative w-full h-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-2 gradient-text">Welcome to AI Studio</h2>
            <p className="text-muted-foreground mb-6">
              To get started, please add your API key in the settings menu (gear icon in the top right).
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-500 hover:text-violet-600 transition-colors"
              >
                Get OpenAI API Key →
              </a>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-fuchsia-500 hover:text-fuchsia-600 transition-colors"
              >
                Get Gemini API Key →
              </a>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Tabs defaultValue="chat" className="h-full flex flex-col">
        <div className="glass border-b border-border/50 px-4">
          <TabsList className="bg-transparent h-12 gap-1">
            <TabsTrigger 
              value="chat" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-fuchsia-500/20 data-[state=active]:text-foreground rounded-lg px-4"
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="images" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-fuchsia-500/20 data-[state=active]:text-foreground rounded-lg px-4"
            >
              <ImageIcon className="w-4 h-4" />
              Images
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="flex-1 m-0 overflow-hidden">
          <ChatContainer />
        </TabsContent>

        <TabsContent value="images" className="flex-1 m-0 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <ImageGenerator />
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
