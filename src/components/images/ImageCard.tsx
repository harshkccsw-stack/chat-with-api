'use client';

import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/lib/utils';
import { useImageStore } from '@/store/imageStore';
import { GeneratedImage } from '@/types/image';
import { Copy, Download, Heart, Maximize2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface ImageCardProps {
  image: GeneratedImage;
  onPreview: () => void;
  onDelete: () => void;
}

export function ImageCard({ image, onPreview, onDelete }: ImageCardProps) {
  const { favorites, toggleFavorite } = useImageStore();
  const isFavorite = favorites.includes(image.id);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `generated-image-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image download started');
  };

  const handleCopyUrl = async () => {
    const success = await copyToClipboard(image.url);
    if (success) {
      toast.success('Image URL copied');
    }
  };

  return (
    <div className="group relative bg-card border border-border/50 rounded-2xl overflow-hidden transition-all duration-300 hover:border-violet-500/30 hover:glow-sm">
      <div className="aspect-square relative">
        <Image src={image.url} alt={image.prompt} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4 gap-2">
          <Button variant="secondary" size="icon" onClick={onPreview} className="h-9 w-9 rounded-xl glass border-white/20 hover:bg-white/20">
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={handleDownload} className="h-9 w-9 rounded-xl glass border-white/20 hover:bg-white/20">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={handleCopyUrl} className="h-9 w-9 rounded-xl glass border-white/20 hover:bg-white/20">
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={() => toggleFavorite(image.id)} className="h-9 w-9 rounded-xl glass border-white/20 hover:bg-white/20">
            <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </Button>
          <Button variant="destructive" size="icon" onClick={onDelete} className="h-9 w-9 rounded-xl">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        {/* Favorite indicator */}
        {isFavorite && (
          <div className="absolute top-3 right-3">
            <div className="w-8 h-8 rounded-full bg-rose-500/90 flex items-center justify-center shadow-lg">
              <Heart className="w-4 h-4 fill-white text-white" />
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-sm line-clamp-2 text-foreground/90">{image.prompt}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-600 dark:text-violet-400">
            {image.model}
          </span>
          <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
            {image.size}
          </span>
        </div>
      </div>
    </div>
  );
}
