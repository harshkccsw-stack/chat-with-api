'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { DALLE2_SIZES, DALLE3_SIZES, GEMINI_IMAGE_SIZES, IMAGE_MODEL_NAMES, IMAGEN_SIZES } from '@/lib/constants';
import { generateId } from '@/lib/utils';
import { useImageStore } from '@/store/imageStore';
import { useSettingsStore } from '@/store/settingsStore';
import { ImageModel } from '@/types/image';
import { Loader2 } from 'lucide-react';
import React from 'react';
import toast from 'react-hot-toast';
import { ImageGallery } from './ImageGallery';

type Provider = 'openai' | 'gemini' | 'imagen';

function getProviderFromModel(model: string): Provider {
  if (model.startsWith('gemini-')) return 'gemini';
  if (model.startsWith('imagen-')) return 'imagen';
  return 'openai';
}

function getAvailableSizes(model: string) {
  if (model === 'dall-e-3') return DALLE3_SIZES;
  if (model === 'dall-e-2') return DALLE2_SIZES;
  if (model.startsWith('imagen-')) return IMAGEN_SIZES;
  return GEMINI_IMAGE_SIZES;
}

export function ImageGenerator() {
  const [prompt, setPrompt] = React.useState('');
  const [model, setModel] = React.useState<ImageModel>('dall-e-3');
  const [size, setSize] = React.useState('1024x1024');
  const [quality, setQuality] = React.useState<'standard' | 'hd'>('standard');
  const [style, setStyle] = React.useState<'vivid' | 'natural'>('vivid');
  const [numImages, setNumImages] = React.useState(1);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const { images, addImages, removeImage } = useImageStore();
  const { apiKeys, vertexAI } = useSettingsStore();

  const provider = getProviderFromModel(model);
  const availableSizes = getAvailableSizes(model);
  const isOpenAI = provider === 'openai';
  const isGemini = provider === 'gemini';
  const isImagen = provider === 'imagen';
  const isDallE3 = model === 'dall-e-3';
  const isDallE2 = model === 'dall-e-2';
  const hasVertexConfig = !!(vertexAI?.projectId && vertexAI?.serviceAccountJson);

  // Reset size when model changes if current size is not available
  React.useEffect(() => {
    const sizes = getAvailableSizes(model);
    if (!sizes.includes(size as any)) {
      setSize(sizes[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  const handleGenerate = async () => {
    // Check for required API keys/config
    if (isImagen) {
      if (!hasVertexConfig) {
        toast.error('Please configure Vertex AI (Project ID and Service Account JSON) in settings.');
        return;
      }
    } else if (isGemini) {
      if (!apiKeys.gemini) {
        toast.error('Please set your Gemini API key in settings.');
        return;
      }
    } else if (isOpenAI) {
      if (!apiKeys.openai) {
        toast.error('Please set your OpenAI API key in settings');
        return;
      }
    }

    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (isOpenAI) {
        headers['x-api-key'] = apiKeys.openai!;
      } else if (isGemini) {
        headers['x-gemini-api-key'] = apiKeys.gemini!;
      } else if (isImagen && vertexAI) {
        headers['x-vertex-project-id'] = vertexAI.projectId!;
        headers['x-vertex-location'] = vertexAI.location || 'us-central1';
        // Service account JSON is sent in the body, not headers (too large for headers)
      }

      const response = await fetch('/api/images', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt,
          model,
          size,
          quality: isDallE3 ? quality : undefined,
          style: isDallE3 ? style : undefined,
          n: isDallE2 ? numImages : (isGemini ? numImages : 1),
          // Include service account JSON in body for Imagen
          vertexServiceAccount: isImagen ? vertexAI?.serviceAccountJson : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate image');
      }

      const data = await response.json();
      
      const newImages = data.images.map((img: any) => ({
        id: generateId(),
        url: img.url,
        prompt,
        model,
        size,
        quality: isDallE3 ? quality : undefined,
        style: isDallE3 ? style : undefined,
        createdAt: data.created * 1000,
        revisedPrompt: img.revised_prompt,
      }));

      addImages(newImages);
      toast.success(`Generated ${newImages.length} image(s) successfully!`);
    } catch (error: any) {
      console.error('Image generation error:', error);
      toast.error(error.message || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Generation Form */}
      <div className="relative">
        {/* Decorative gradient background */}
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 via-fuchsia-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-50" />
        
        <div className="relative glass border border-border/50 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold gradient-text">Image Generator</h2>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block text-foreground/80">Prompt</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="min-h-[100px] rounded-xl glass border-border/50 focus:border-violet-500/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-foreground/80">Model</label>
              <Select value={model} onValueChange={(value: ImageModel) => setModel(value)}>
                <SelectTrigger className="rounded-xl glass border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass border-border/50">
                  <SelectItem value="dall-e-3" disabled={!apiKeys.openai}>
                    {IMAGE_MODEL_NAMES['dall-e-3']} {!apiKeys.openai && '(No API Key)'}
                  </SelectItem>
                  <SelectItem value="dall-e-2" disabled={!apiKeys.openai}>
                    {IMAGE_MODEL_NAMES['dall-e-2']} {!apiKeys.openai && '(No API Key)'}
                  </SelectItem>
                  <SelectItem value="gemini-2.0-flash-exp-image-generation" disabled={!apiKeys.gemini}>
                    {IMAGE_MODEL_NAMES['gemini-2.0-flash-exp-image-generation']} {!apiKeys.gemini && '(No Gemini Key)'}
                  </SelectItem>
                  <SelectItem value="gemini-2.0-flash-preview-image-generation" disabled={!apiKeys.gemini}>
                    {IMAGE_MODEL_NAMES['gemini-2.0-flash-preview-image-generation']} {!apiKeys.gemini && '(No Gemini Key)'}
                  </SelectItem>
                  <SelectItem value="imagen-3.0-generate-002" disabled={!hasVertexConfig}>
                    {IMAGE_MODEL_NAMES['imagen-3.0-generate-002']} {!hasVertexConfig && '(No Vertex AI Config)'}
                  </SelectItem>
                  <SelectItem value="imagen-3.0-fast-generate-001" disabled={!hasVertexConfig}>
                    {IMAGE_MODEL_NAMES['imagen-3.0-fast-generate-001']} {!hasVertexConfig && '(No Vertex AI Config)'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-foreground/80">Size</label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger className="rounded-xl glass border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass border-border/50">
                  {availableSizes.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isDallE3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-foreground/80">Quality</label>
                <Select value={quality} onValueChange={(value: any) => setQuality(value)}>
                  <SelectTrigger className="rounded-xl glass border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass border-border/50">
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="hd">HD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-foreground/80">Style</label>
                <Select value={style} onValueChange={(value: any) => setStyle(value)}>
                  <SelectTrigger className="rounded-xl glass border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass border-border/50">
                    <SelectItem value="vivid">Vivid</SelectItem>
                    <SelectItem value="natural">Natural</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {(isDallE2 || isGemini) && (
            <div>
              <label className="text-sm font-medium mb-2 block text-foreground/80">Number of Images: {numImages}</label>
              <Slider
                value={[numImages]}
                onValueChange={([value]) => setNumImages(value)}
                min={1}
                max={isDallE2 ? 10 : 4}
                step={1}
                className="py-2"
              />
            </div>
          )}

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !prompt.trim()} 
            className="w-full gradient-bg hover:opacity-90 transition-opacity glow-sm rounded-xl h-11"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Image'
            )}
          </Button>
        </div>
      </div>

      {/* Gallery Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 gradient-text">Generated Images</h2>
        <ImageGallery images={images} onDeleteImage={removeImage} />
      </div>
    </div>
  );
}
