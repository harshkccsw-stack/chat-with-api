import { generateId } from '@/lib/utils';
import { GeneratedImage, ImageGenerationRequest } from '@/types/image';
import { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * Custom hook for image generation
 */
export function useImageGeneration(apiKey: string | null) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);

  const generateImage = async (request: ImageGenerationRequest) => {
    if (!apiKey) {
      toast.error('Please set your API key first');
      return null;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate image');
      }

      const data = await response.json();
      
      // Convert response to GeneratedImage format
      const newImages: GeneratedImage[] = data.images.map((img: any) => ({
        id: generateId(),
        url: img.url,
        prompt: request.prompt,
        model: request.model,
        size: request.size,
        quality: request.quality,
        style: request.style,
        createdAt: data.created * 1000,
        revisedPrompt: img.revised_prompt,
      }));

      setImages(prev => [...newImages, ...prev]);
      toast.success('Images generated successfully!');
      return newImages;
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate image');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearImages = () => {
    setImages([]);
  };

  return {
    generateImage,
    isGenerating,
    images,
    clearImages,
  };
}
