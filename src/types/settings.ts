import { ModelParameters } from './chat';

/**
 * AI Provider types
 */
export type AIProvider = 'openai' | 'gemini' | 'claude';

/**
 * API Keys for different providers
 */
export interface APIKeys {
  openai: string | null;
  gemini: string | null;
  claude: string | null;
}

/**
 * Vertex AI configuration for Imagen
 * Uses Service Account JSON for authentication (no token refresh needed)
 */
export interface VertexAIConfig {
  projectId: string | null;
  location: string;
  serviceAccountJson: string | null; // The full JSON content of the service account key
}

/**
 * Application settings
 */
export interface Settings {
  apiKeys: APIKeys;
  vertexAI: VertexAIConfig;
  theme: 'light' | 'dark' | 'system';
  defaultModel: string;
  defaultProvider: AIProvider;
  streamingEnabled: boolean;
  parameters: ModelParameters;
}

/**
 * Model information
 */
export interface ModelInfo {
  id: string;
  name: string;
  provider: AIProvider;
  contextWindow: number;
  description: string;
}

/**
 * Parameter preset type
 */
export type ParameterPreset = 'creative' | 'balanced' | 'precise';
