'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { GeneratedImage } from '@/types/image';
import Image from 'next/image';
import React from 'react';
import { ImageCard } from './ImageCard';

interface ImageGalleryProps {
  images: GeneratedImage[];
  onDeleteImage: (id: string) => void;
}

export function ImageGallery({ images, onDeleteImage }: ImageGalleryProps) {
  const [previewImage, setPreviewImage] = React.useState<GeneratedImage | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <p>No images generated yet</p>
          <p className="text-sm">Generate your first image to see it here</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onPreview={() => setPreviewImage(image)}
            onDelete={() => onDeleteImage(image.id)}
          />
        ))}
      </div>

      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl">
          {previewImage && (
            <div className="space-y-4">
              <div className="relative aspect-square">
                <Image src={previewImage.url} alt={previewImage.prompt} fill className="object-contain" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Prompt</h3>
                <p className="text-sm">{previewImage.prompt}</p>
              </div>
              {previewImage.revisedPrompt && (
                <div>
                  <h3 className="font-semibold mb-2">Revised Prompt</h3>
                  <p className="text-sm text-muted-foreground">{previewImage.revisedPrompt}</p>
                </div>
              )}
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Model: {previewImage.model}</span>
                <span>Size: {previewImage.size}</span>
                {previewImage.quality && <span>Quality: {previewImage.quality}</span>}
                {previewImage.style && <span>Style: {previewImage.style}</span>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
