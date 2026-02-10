import { STORAGE_KEYS } from '@/lib/constants';
import { GeneratedImage } from '@/types/image';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Maximum number of images to store (to prevent localStorage quota issues)
const MAX_STORED_IMAGES = 20;

interface ImageState {
  images: GeneratedImage[];
  favorites: string[];
  
  // Actions
  addImages: (images: GeneratedImage[]) => void;
  removeImage: (id: string) => void;
  toggleFavorite: (id: string) => void;
  clearImages: () => void;
}

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
      // Quota exceeded - try to clear old data and retry
      console.warn('localStorage quota exceeded, clearing old images...');
      try {
        // Parse current value and keep only favorites + recent images
        const parsed = JSON.parse(value);
        if (parsed.state?.images) {
          const favorites = new Set(parsed.state.favorites || []);
          // Keep favorites and limit total
          const favoriteImages = parsed.state.images.filter((img: GeneratedImage) => favorites.has(img.id));
          const nonFavorites = parsed.state.images.filter((img: GeneratedImage) => !favorites.has(img.id));
          parsed.state.images = [
            ...favoriteImages.slice(0, 10),
            ...nonFavorites.slice(0, Math.max(0, 10 - favoriteImages.length))
          ];
          localStorage.setItem(name, JSON.stringify(parsed));
        }
      } catch {
        // If all else fails, clear the storage
        console.warn('Clearing image history due to quota issues');
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

export const useImageStore = create<ImageState>()(
  persist(
    (set) => ({
      images: [],
      favorites: [],

      addImages: (newImages: GeneratedImage[]) => {
        set(state => {
          const allImages = [...newImages, ...state.images];
          // Keep favorites and limit total stored images
          const favorites = new Set(state.favorites);
          const favoriteImages = allImages.filter(img => favorites.has(img.id));
          const nonFavorites = allImages.filter(img => !favorites.has(img.id));
          const limitedImages = [
            ...favoriteImages,
            ...nonFavorites.slice(0, MAX_STORED_IMAGES - favoriteImages.length)
          ];
          return { images: limitedImages };
        });
      },

      removeImage: (id: string) => {
        set(state => ({
          images: state.images.filter(img => img.id !== id),
          favorites: state.favorites.filter(fav => fav !== id),
        }));
      },

      toggleFavorite: (id: string) => {
        set(state => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter(fav => fav !== id)
            : [...state.favorites, id],
        }));
      },

      clearImages: () => {
        set({ images: [], favorites: [] });
      },
    }),
    {
      name: STORAGE_KEYS.IMAGE_HISTORY,
      storage: customStorage as any,
    }
  )
);
