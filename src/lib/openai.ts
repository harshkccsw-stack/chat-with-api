import { ModelParameters } from '@/types/chat';
import OpenAI from 'openai';

/**
 * Create OpenAI client instance
 */
export function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: false, // Only use in API routes
  });
}

/**
 * Stream chat completion (for API routes)
 */
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export async function streamChatCompletion(
  client: OpenAI,
  messages: ChatCompletionMessageParam[],
  model: string,
  parameters: ModelParameters
) {
  const stream = await client.chat.completions.create({
    model,
    messages,
    stream: true,
    temperature: parameters.temperature,
    max_tokens: parameters.maxTokens,
    top_p: parameters.topP,
    frequency_penalty: parameters.frequencyPenalty,
    presence_penalty: parameters.presencePenalty,
  });

  return stream;
}

/**
 * Create chat completion (non-streaming, for API routes)
 */
export async function createChatCompletion(
  client: OpenAI,
  messages: ChatCompletionMessageParam[],
  model: string,
  parameters: ModelParameters
) {
  const completion = await client.chat.completions.create({
    model,
    messages,
    stream: false,
    temperature: parameters.temperature,
    max_tokens: parameters.maxTokens,
    top_p: parameters.topP,
    frequency_penalty: parameters.frequencyPenalty,
    presence_penalty: parameters.presencePenalty,
  });

  return completion;
}

/**
 * Generate images (for API routes)
 */
export async function generateImages(
  client: OpenAI,
  prompt: string,
  options: {
    model: 'dall-e-2' | 'dall-e-3';
    size: string;
    quality?: string;
    style?: string;
    n?: number;
  }
) {
  const response = await client.images.generate({
    model: options.model,
    prompt,
    size: options.size as any,
    quality: options.quality as any,
    style: options.style as any,
    n: options.n || 1,
  });

  return response;
}

/**
 * List available models (for API routes)
 */
export async function listModels(client: OpenAI) {
  const models = await client.models.list();
  return models;
}

/**
 * Validate API key by making a test request
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const client = createOpenAIClient(apiKey);
    await client.models.list();
    return true;
  } catch (error) {
    return false;
  }
}
