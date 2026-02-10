import { LIMITS, STORAGE_KEYS } from './constants';

/**
 * Storage utility functions for localStorage
 */

/**
 * Get item from localStorage with JSON parsing
 */
export function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
}

/**
 * Set item in localStorage with JSON stringification
 */
export function setItem<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
      // Try to clean up old data
      cleanupOldData();
    } else {
      console.error(`Error writing to localStorage (${key}):`, error);
    }
    return false;
  }
}

/**
 * Remove item from localStorage
 */
export function removeItem(key: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
}

/**
 * Clear all application data from localStorage
 */
export function clearAll(): void {
  if (typeof window === 'undefined') return;
  
  Object.values(STORAGE_KEYS).forEach(key => {
    removeItem(key);
  });
}

/**
 * Clean up old data to free space
 */
function cleanupOldData(): void {
  try {
    // Remove old conversations
    const conversations = getItem(STORAGE_KEYS.CONVERSATIONS, []);
    if (conversations.length > LIMITS.MAX_CONVERSATIONS) {
      const sorted = conversations.sort((a: any, b: any) => b.updatedAt - a.updatedAt);
      const kept = sorted.slice(0, LIMITS.MAX_CONVERSATIONS);
      setItem(STORAGE_KEYS.CONVERSATIONS, kept);
    }

    // Remove old images
    const images = getItem(STORAGE_KEYS.IMAGE_HISTORY, []);
    if (images.length > LIMITS.MAX_IMAGE_HISTORY) {
      const sorted = images.sort((a: any, b: any) => b.createdAt - a.createdAt);
      const kept = sorted.slice(0, LIMITS.MAX_IMAGE_HISTORY);
      setItem(STORAGE_KEYS.IMAGE_HISTORY, kept);
    }
  } catch (error) {
    console.error('Error cleaning up old data:', error);
  }
}

/**
 * Encrypt API key (simple obfuscation - NOT cryptographically secure)
 * For production, consider using a more secure method
 */
export function encryptApiKey(key: string): string {
  return btoa(key);
}

/**
 * Decrypt API key
 */
export function decryptApiKey(encrypted: string): string {
  try {
    return atob(encrypted);
  } catch {
    return '';
  }
}
