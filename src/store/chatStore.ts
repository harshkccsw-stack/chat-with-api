import { DEFAULT_MODEL, DEFAULT_PARAMETERS, STORAGE_KEYS } from '@/lib/constants';
import { generateId } from '@/lib/utils';
import { Conversation, Message } from '@/types/chat';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Maximum messages per conversation to store (to prevent localStorage quota issues)
const MAX_MESSAGES_PER_CONVERSATION = 50;
const MAX_CONVERSATIONS = 20;

// Custom storage that handles quota errors
const customStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch {
      console.warn('Failed to read from localStorage');
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      console.warn('localStorage quota exceeded, trimming conversations...');
      try {
        const parsed = JSON.parse(value);
        if (parsed.state?.conversations) {
          // Trim messages in each conversation and limit total conversations
          parsed.state.conversations = parsed.state.conversations
            .slice(0, MAX_CONVERSATIONS)
            .map((conv: Conversation) => ({
              ...conv,
              messages: conv.messages.slice(-MAX_MESSAGES_PER_CONVERSATION),
            }));
          localStorage.setItem(name, JSON.stringify(parsed));
        }
      } catch {
        console.warn('Clearing conversations due to quota issues');
        localStorage.removeItem(name);
      }
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch {
      console.warn('Failed to remove from localStorage');
    }
  },
};

interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  
  // Actions
  createConversation: (systemMessage?: string) => string;
  deleteConversation: (id: string) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  setCurrentConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, content: string) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  clearAllConversations: () => void;
  getCurrentConversation: () => Conversation | null;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,

      createConversation: (systemMessage?: string) => {
        const id = generateId();
        const newConversation: Conversation = {
          id,
          title: 'New Conversation',
          messages: [],
          model: DEFAULT_MODEL,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          systemMessage,
          parameters: DEFAULT_PARAMETERS,
        };

        set(state => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: id,
        }));

        return id;
      },

      deleteConversation: (id: string) => {
        set(state => ({
          conversations: state.conversations.filter(c => c.id !== id),
          currentConversationId: state.currentConversationId === id ? null : state.currentConversationId,
        }));
      },

      updateConversation: (id: string, updates: Partial<Conversation>) => {
        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
          ),
        }));
      },

      setCurrentConversation: (id: string | null) => {
        set({ currentConversationId: id });
      },

      addMessage: (conversationId: string, message: Message) => {
        set(state => {
          const conversations = state.conversations.map(c => {
            if (c.id !== conversationId) return c;

            const messages = [...c.messages, message];
            
            // Auto-generate title from first user message
            let title = c.title;
            if (c.title === 'New Conversation' && message.role === 'user') {
              title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
            }

            return {
              ...c,
              messages,
              title,
              updatedAt: Date.now(),
            };
          });

          return { conversations };
        });
      },

      updateMessage: (conversationId: string, messageId: string, content: string) => {
        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map(m =>
                    m.id === messageId ? { ...m, content } : m
                  ),
                  updatedAt: Date.now(),
                }
              : c
          ),
        }));
      },

      deleteMessage: (conversationId: string, messageId: string) => {
        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.filter(m => m.id !== messageId),
                  updatedAt: Date.now(),
                }
              : c
          ),
        }));
      },

      clearAllConversations: () => {
        set({ conversations: [], currentConversationId: null });
      },

      getCurrentConversation: () => {
        const state = get();
        if (!state.currentConversationId) return null;
        return state.conversations.find(c => c.id === state.currentConversationId) || null;
      },
    }),
    {
      name: STORAGE_KEYS.CONVERSATIONS,
      storage: customStorage as any,
    }
  )
);
