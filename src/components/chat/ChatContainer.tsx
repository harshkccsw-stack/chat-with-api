'use client';

import { generateId } from '@/lib/utils';
import { useChatStore } from '@/store/chatStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Message } from '@/types/chat';
import { Loader2 } from 'lucide-react';
import React from 'react';
import toast from 'react-hot-toast';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';

export function ChatContainer() {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [streamingMessage, setStreamingMessage] = React.useState<string>('');
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const { getCurrentConversation, addMessage, updateMessage, deleteMessage, updateConversation } = useChatStore();
  const { apiKeys, streamingEnabled, parameters, defaultModel, vertexAI } = useSettingsStore();

  const conversation = getCurrentConversation();

  // Get the provider for current model
  const getProviderForModel = (modelId: string) => {
    if (modelId.startsWith('gpt') || modelId.startsWith('o1') || modelId.startsWith('chatgpt')) return 'openai';
    if (modelId.startsWith('gemini')) return 'gemini';
    if (modelId.startsWith('claude')) return 'claude';
    return 'openai';
  };

  // Get the provider for image model
  const getProviderForImageModel = (modelId: string): 'openai' | 'gemini' | 'imagen' => {
    if (modelId.startsWith('dall-e')) return 'openai';
    if (modelId.startsWith('gemini-')) return 'gemini';
    if (modelId.startsWith('imagen')) return 'imagen';
    return 'openai';
  };

  const handleModelChange = (modelId: string) => {
    if (conversation) {
      updateConversation(conversation.id, { model: modelId });
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!conversation) return;
    
    const provider = getProviderForModel(conversation.model);
    const currentApiKey = apiKeys[provider];
    
    if (!currentApiKey) {
      toast.error(`Please set your ${provider.charAt(0).toUpperCase() + provider.slice(1)} API key in settings`);
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    addMessage(conversation.id, userMessage);
    setIsGenerating(true);
    setStreamingMessage('');

    const assistantMessageId = generateId();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      model: conversation.model,
    };

    addMessage(conversation.id, assistantMessage);

    try {
      const messages = [...conversation.messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      if (conversation.systemMessage) {
        messages.unshift({
          role: 'system',
          content: conversation.systemMessage,
        });
      }

      abortControllerRef.current = new AbortController();

      // Build headers based on provider
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (provider === 'openai') {
        headers['x-api-key'] = currentApiKey;
      } else if (provider === 'gemini') {
        headers['x-gemini-api-key'] = currentApiKey;
      } else if (provider === 'claude') {
        headers['x-claude-api-key'] = currentApiKey;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages,
          model: conversation.model,
          stream: streamingEnabled,
          temperature: parameters.temperature,
          max_tokens: parameters.maxTokens,
          top_p: parameters.topP,
          frequency_penalty: parameters.frequencyPenalty,
          presence_penalty: parameters.presencePenalty,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get response');
      }

      if (streamingEnabled && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content || '';
                if (content) {
                  fullContent += content;
                  setStreamingMessage(fullContent);
                  updateMessage(conversation.id, assistantMessageId, fullContent);
                }
              } catch (e) {
                console.error('Error parsing stream:', e);
              }
            }
          }
        }
      } else {
        const data = await response.json();
        updateMessage(conversation.id, assistantMessageId, data.message.content);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.error('Generation stopped');
      } else {
        console.error('Chat error:', error);
        toast.error(error.message || 'Failed to get response');
        deleteMessage(conversation.id, assistantMessageId);
      }
    } finally {
      setIsGenerating(false);
      setStreamingMessage('');
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleEditMessage = (messageId: string, content: string) => {
    if (conversation) {
      updateMessage(conversation.id, messageId, content);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (conversation) {
      deleteMessage(conversation.id, messageId);
    }
  };

  const handleRegenerateMessage = async (messageId: string) => {
    if (!conversation) return;
    
    const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
    if (messageIndex <= 0) return;

    const previousMessage = conversation.messages[messageIndex - 1];
    if (previousMessage.role !== 'user') return;

    deleteMessage(conversation.id, messageId);
    await handleSendMessage(previousMessage.content);
  };

  const handleGenerateImage = async (prompt: string, imageModel: string = 'dall-e-3') => {
    if (!conversation) return;
    
    const provider = getProviderForImageModel(imageModel);
    
    // Check for required credentials based on provider
    if (provider === 'openai' && !apiKeys.openai) {
      toast.error('Please set your OpenAI API key in settings');
      return;
    }
    if (provider === 'gemini' && !apiKeys.gemini) {
      toast.error('Please set your Gemini API key in settings');
      return;
    }
    if (provider === 'imagen' && (!vertexAI?.projectId || !vertexAI?.serviceAccountJson)) {
      toast.error('Please configure Vertex AI in settings for Imagen models');
      return;
    }

    const loadingToast = toast.loading('Generating image...');

    try {
      // Build headers based on provider
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (provider === 'openai') {
        headers['x-api-key'] = apiKeys.openai!;
      } else if (provider === 'gemini') {
        headers['x-gemini-api-key'] = apiKeys.gemini!;
      } else if (provider === 'imagen') {
        headers['x-vertex-project-id'] = vertexAI!.projectId!;
        headers['x-vertex-location'] = vertexAI!.location || 'us-central1';
      }

      const response = await fetch('/api/images', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt,
          model: imageModel,
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid',
          n: 1,
          vertexServiceAccount: provider === 'imagen' ? vertexAI?.serviceAccountJson : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate image');
      }

      const data = await response.json();
      
      // Add assistant message with the generated image
      const imageMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: `I've generated an image based on your prompt: "${prompt}"`,
        timestamp: Date.now(),
        images: data.images.map((img: any) => img.url),
      };

      addMessage(conversation.id, imageMessage);
      toast.success('Image generated successfully!', { id: loadingToast });
    } catch (error: any) {
      console.error('Image generation error:', error);
      toast.error(error.message || 'Failed to generate image', { id: loadingToast });
    }
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">No conversation selected</h2>
          <p>Create a new conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <MessageList
          messages={conversation.messages}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
          onRegenerateMessage={handleRegenerateMessage}
        />
        {isGenerating && streamingMessage && (
          <div className="flex gap-2 items-center p-4 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating...</span>
          </div>
        )}
      </div>
      <ChatInput
        onSend={handleSendMessage}
        disabled={isGenerating}
        isGenerating={isGenerating}
        onStop={handleStopGeneration}
        currentModel={conversation.model}
        onModelChange={handleModelChange}
      />
    </div>
  );
}
