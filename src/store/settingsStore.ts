import { DEFAULT_MODEL, DEFAULT_PARAMETERS, STORAGE_KEYS } from '@/lib/constants';
import { AIProvider, Settings, VertexAIConfig } from '@/types/settings';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState extends Settings {
  // Actions
  setApiKey: (provider: AIProvider, key: string | null) => void;
  setVertexAI: (config: Partial<VertexAIConfig>) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setDefaultModel: (model: string) => void;
  setDefaultProvider: (provider: AIProvider) => void;
  setStreamingEnabled: (enabled: boolean) => void;
  updateParameters: (params: Partial<Settings['parameters']>) => void;
  resetParameters: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKeys: {
        openai: null,
        gemini: null,
        claude: null,
      },
      vertexAI: {
        projectId: null,
        location: 'us-central1',
        serviceAccountJson: null,
      },
      theme: 'system',
      defaultModel: DEFAULT_MODEL,
      defaultProvider: 'openai',
      streamingEnabled: true,
      parameters: DEFAULT_PARAMETERS,

      setApiKey: (provider: AIProvider, key: string | null) => {
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key },
        }));
      },

      setVertexAI: (config: Partial<VertexAIConfig>) => {
        set((state) => ({
          vertexAI: { ...state.vertexAI, ...config },
        }));
      },

      setDefaultProvider: (provider: AIProvider) => {
        set({ defaultProvider: provider });
      },

      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ theme });
        
        // Apply theme to document
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          root.classList.remove('light', 'dark');

          if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light';
            root.classList.add(systemTheme);
          } else {
            root.classList.add(theme);
          }
        }
      },

      setDefaultModel: (model: string) => {
        set({ defaultModel: model });
      },

      setStreamingEnabled: (enabled: boolean) => {
        set({ streamingEnabled: enabled });
      },

      updateParameters: (params) => {
        set(state => ({
          parameters: { ...state.parameters, ...params },
        }));
      },

      resetParameters: () => {
        set({ parameters: DEFAULT_PARAMETERS });
      },
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
    }
  )
);
