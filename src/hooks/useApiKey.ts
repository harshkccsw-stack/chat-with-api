import { STORAGE_KEYS } from '@/lib/constants';
import { getItem, removeItem, setItem } from '@/lib/storage';
import { validateApiKey as validateKey } from '@/lib/utils';
import { useCallback, useState } from 'react';

/**
 * Custom hook for managing API key
 */
export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string | null>(() => {
    return getItem<string | null>(STORAGE_KEYS.API_KEY, null);
  });

  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const setApiKey = useCallback((key: string | null) => {
    setApiKeyState(key);
    if (key) {
      setItem(STORAGE_KEYS.API_KEY, key);
    } else {
      removeItem(STORAGE_KEYS.API_KEY);
    }
    setIsValid(null);
  }, []);

  const validateApiKey = useCallback(async (key: string) => {
    setIsValidating(true);
    try {
      // Basic format validation
      if (!validateKey(key)) {
        setIsValid(false);
        return false;
      }

      // Test API key with a simple request
      const response = await fetch('/api/models', {
        headers: {
          'x-api-key': key,
        },
      });

      const valid = response.ok;
      setIsValid(valid);
      return valid;
    } catch (error) {
      console.error('API key validation failed:', error);
      setIsValid(false);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearApiKey = useCallback(() => {
    setApiKey(null);
  }, [setApiKey]);

  return {
    apiKey,
    setApiKey,
    validateApiKey,
    clearApiKey,
    isValidating,
    isValid,
  };
}
