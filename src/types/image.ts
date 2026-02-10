/**
 * Image model types
 */
export type OpenAIImageModel = 'dall-e-2' | 'dall-e-3';
export type GeminiImageModel = 'gemini-2.0-flash-exp-image-generation' | 'gemini-2.0-flash-preview-image-generation';
export type ImagenModel = 'imagen-3.0-generate-002' | 'imagen-3.0-fast-generate-001';
export type ImageModel = OpenAIImageModel | GeminiImageModel | ImagenModel;

/**
 * Image generation request payload
 */
export interface ImageGenerationRequest {
  prompt: string;
  model: ImageModel;
  size: '256x256' | '512x512' | '1024x1024' | '1024x1792' | '1792x1024' | '1536x1536' | '1024x1536' | '1536x1024' | '768x1344' | '1344x768' | '768x1024' | '1024x768';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number;
  provider?: 'openai' | 'gemini' | 'imagen';
}

/**
 * Generated image type
 */
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  size: string;
  quality?: string;
  style?: string;
  createdAt: number;
  revisedPrompt?: string;
}

/**
 * Image generation response from OpenAI
 */
export interface ImageGenerationResponse {
  images: Array<{
    url: string;
    revised_prompt?: string;
  }>;
  created: number;
}
