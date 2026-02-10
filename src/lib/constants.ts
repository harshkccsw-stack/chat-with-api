import { ModelParameters } from '@/types/chat';
import { ModelInfo } from '@/types/settings';

/**
 * Application constants
 */

// Available chat models
export const CHAT_MODELS: ModelInfo[] = [
  // OpenAI Models
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', contextWindow: 128000, description: 'Most capable multimodal model' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', contextWindow: 128000, description: 'Affordable and intelligent small model' },
  { id: 'chatgpt-4o-latest', name: 'ChatGPT-4o Latest', provider: 'openai', contextWindow: 128000, description: 'Latest ChatGPT model with vision' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', contextWindow: 128000, description: 'Latest GPT-4 with vision' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'openai', contextWindow: 8192, description: 'Powerful general-purpose model' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', contextWindow: 16385, description: 'Fast and cost-effective' },
  { id: 'o1-preview', name: 'O1 Preview', provider: 'openai', contextWindow: 128000, description: 'Reasoning model preview' },
  { id: 'o1-mini', name: 'O1 Mini', provider: 'openai', contextWindow: 128000, description: 'Faster reasoning model' },
  
  // Gemini Models
  { id: 'gemini-2.5-pro-preview-05-06', name: 'Gemini 2.5 Pro', provider: 'gemini', contextWindow: 1000000, description: 'Most advanced thinking model' },
  { id: 'gemini-2.5-flash-preview-05-20', name: 'Gemini 2.5 Flash', provider: 'gemini', contextWindow: 1000000, description: 'Fast adaptive thinking model' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'gemini', contextWindow: 1000000, description: 'Latest stable multimodal model' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', provider: 'gemini', contextWindow: 1000000, description: 'Cost-effective and low latency' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', contextWindow: 2000000, description: 'Complex reasoning tasks' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini', contextWindow: 1000000, description: 'Fast and versatile performance' },
  { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B', provider: 'gemini', contextWindow: 1000000, description: 'High volume, lower intelligence' },
  
  // Claude Models
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'claude', contextWindow: 200000, description: 'Most intelligent model' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'claude', contextWindow: 200000, description: 'Fastest model' },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'claude', contextWindow: 200000, description: 'Powerful model for complex tasks' },
  { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'claude', contextWindow: 200000, description: 'Balanced performance' },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'claude', contextWindow: 200000, description: 'Fast and compact' },
];

// Default model
export const DEFAULT_MODEL = 'gpt-4o-mini';

// Image models by provider
export const IMAGE_MODELS = {
  openai: ['dall-e-2', 'dall-e-3'],
  gemini: [
    'gemini-2.0-flash-exp-image-generation',
    'gemini-2.0-flash-preview-image-generation',
  ],
  imagen: [
    'imagen-3.0-generate-002',
    'imagen-3.0-fast-generate-001',
  ],
  claude: [], // Claude doesn't support image generation
} as const;

export const ALL_IMAGE_MODELS = [
  'dall-e-2', 
  'dall-e-3', 
  'gemini-2.0-flash-exp-image-generation',
  'gemini-2.0-flash-preview-image-generation',
  'imagen-3.0-generate-002',
  'imagen-3.0-fast-generate-001',
] as const;

// Image model display names
export const IMAGE_MODEL_NAMES: Record<string, string> = {
  'dall-e-2': 'DALL-E 2',
  'dall-e-3': 'DALL-E 3',
  'gemini-2.0-flash-exp-image-generation': 'Gemini 2.0 Flash (Image)',
  'gemini-2.0-flash-preview-image-generation': 'Gemini 2.0 Flash Preview',
  'imagen-3.0-generate-002': 'Imagen 3',
  'imagen-3.0-fast-generate-001': 'Imagen 3 Fast',
};

// DALL-E 3 resolutions
export const DALLE3_SIZES = ['1024x1024', '1024x1792', '1792x1024'] as const;

// DALL-E 2 resolutions
export const DALLE2_SIZES = ['256x256', '512x512', '1024x1024'] as const;

// Gemini/Imagen resolutions (aspect ratios)
export const GEMINI_IMAGE_SIZES = ['1024x1024', '1536x1536', '1024x1536', '1536x1024'] as const;
export const IMAGEN_SIZES = ['1024x1024', '768x1344', '1344x768', '768x1024', '1024x768'] as const;

// Default model parameters
export const DEFAULT_PARAMETERS: ModelParameters = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

// Parameter presets
export const PARAMETER_PRESETS = {
  creative: {
    temperature: 1.2,
    maxTokens: 2048,
    topP: 0.95,
    frequencyPenalty: 0.5,
    presencePenalty: 0.5,
  },
  balanced: {
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
  precise: {
    temperature: 0.3,
    maxTokens: 2048,
    topP: 0.9,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
} as const;

// LocalStorage keys
export const STORAGE_KEYS = {
  API_KEY: 'openai_api_key',
  CONVERSATIONS: 'conversations',
  SETTINGS: 'settings',
  IMAGE_HISTORY: 'image_history',
  CURRENT_CONVERSATION_ID: 'current_conversation_id',
} as const;

// Limits
export const LIMITS = {
  MAX_CONVERSATIONS: 100,
  MAX_MESSAGES_PER_CONVERSATION: 1000,
  MAX_IMAGE_HISTORY: 50,
} as const;

// System message templates
export const SYSTEM_MESSAGE_TEMPLATES = [
  {
    name: 'Default',
    content: 'You are a helpful assistant.',
  },
  {
    name: 'Code Assistant',
    content: 'You are an expert programmer. Provide clear, well-documented code solutions.',
  },
  {
    name: 'Creative Writer',
    content: 'You are a creative writer. Write engaging, imaginative content.',
  },
  {
    name: 'Technical Expert',
    content: 'You are a technical expert. Provide detailed, accurate technical information.',
  },
] as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  SEND_MESSAGE: 'Enter',
  NEW_LINE: 'Shift+Enter',
  NEW_CONVERSATION: 'Ctrl+K',
  FOCUS_SEARCH: 'Ctrl+/',
  CLOSE_MODAL: 'Escape',
} as const;
