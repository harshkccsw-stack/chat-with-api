'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSettingsStore } from '@/store/settingsStore';
import { AIProvider } from '@/types/settings';
import { Check, Eye, EyeOff, Loader2, X } from 'lucide-react';
import React from 'react';
import toast from 'react-hot-toast';

const PROVIDER_INFO = {
  openai: {
    name: 'OpenAI',
    placeholder: 'sk-...',
    prefix: 'sk-',
    url: 'https://platform.openai.com/api-keys',
    validateEndpoint: '/api/models?provider=openai',
  },
  gemini: {
    name: 'Google Gemini',
    placeholder: 'Your Gemini API key',
    prefix: '', // Gemini keys can have various formats
    url: 'https://aistudio.google.com/app/apikey',
    validateEndpoint: '/api/models?provider=gemini',
  },
  claude: {
    name: 'Anthropic Claude',
    placeholder: 'sk-ant-...',
    prefix: 'sk-ant-',
    url: 'https://console.anthropic.com/settings/keys',
    validateEndpoint: '/api/models?provider=claude',
  },
};

interface ProviderKeyInputProps {
  provider: AIProvider;
}

function ProviderKeyInput({ provider }: ProviderKeyInputProps) {
  const { apiKeys, setApiKey } = useSettingsStore();
  const info = PROVIDER_INFO[provider];
  const currentKey = apiKeys[provider];
  
  const [showKey, setShowKey] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(currentKey || '');
  const [isValidating, setIsValidating] = React.useState(false);
  const [isValid, setIsValid] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    setInputValue(currentKey || '');
  }, [currentKey]);

  const validateApiKey = (key: string): boolean => {
    if (!key.trim()) return false;
    // If no prefix required, just check length
    if (!info.prefix) return key.trim().length > 10;
    return key.startsWith(info.prefix);
  };

  const handleSave = async () => {
    if (!inputValue.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    if (!validateApiKey(inputValue)) {
      const errorMsg = info.prefix 
        ? `Invalid API key format. Key should start with "${info.prefix}"`
        : 'Invalid API key format';
      toast.error(errorMsg);
      setIsValid(false);
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch(info.validateEndpoint, {
        headers: { 'x-api-key': inputValue },
      });

      if (response.ok) {
        setApiKey(provider, inputValue);
        setIsValid(true);
        toast.success(`${info.name} API key saved successfully`);
      } else {
        setIsValid(false);
        toast.error(`Invalid ${info.name} API key`);
      }
    } catch (error) {
      setIsValid(false);
      toast.error(`Failed to validate ${info.name} API key`);
    } finally {
      setIsValidating(false);
    }
  };

  const handleClear = () => {
    setApiKey(provider, null);
    setInputValue('');
    setIsValid(null);
    toast.success(`${info.name} API key cleared`);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div>
        <h3 className="font-medium mb-2">{info.name} API Key</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get your key from{' '}
          <a
            href={info.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {info.name} Platform
          </a>
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showKey ? 'text' : 'password'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={info.placeholder}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-10 w-10"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          {isValid !== null && (
            <div className="flex items-center">
              {isValid ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isValidating || !inputValue.trim()}>
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              'Save & Test'
            )}
          </Button>
          {currentKey && (
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {isValid === true && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md text-sm">
          ✓ API key is valid and working
        </div>
      )}
      {isValid === false && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm">
          ✗ API key validation failed
        </div>
      )}
    </div>
  );
}

function VertexAIConfig() {
  const { vertexAI, setVertexAI } = useSettingsStore();
  const [showJson, setShowJson] = React.useState(false);
  const [projectId, setProjectId] = React.useState(vertexAI?.projectId || '');
  const [location, setLocation] = React.useState(vertexAI?.location || 'us-central1');
  const [serviceAccountJson, setServiceAccountJson] = React.useState(vertexAI?.serviceAccountJson || '');

  React.useEffect(() => {
    setProjectId(vertexAI?.projectId || '');
    setLocation(vertexAI?.location || 'us-central1');
    setServiceAccountJson(vertexAI?.serviceAccountJson || '');
  }, [vertexAI]);

  const handleSave = () => {
    // Validate JSON
    try {
      if (serviceAccountJson) {
        const parsed = JSON.parse(serviceAccountJson);
        if (!parsed.private_key || !parsed.client_email) {
          toast.error('Invalid service account JSON: missing private_key or client_email');
          return;
        }
      }
    } catch {
      toast.error('Invalid JSON format');
      return;
    }

    setVertexAI({
      projectId: projectId || null,
      location: location || 'us-central1',
      serviceAccountJson: serviceAccountJson || null,
    });
    toast.success('Vertex AI configuration saved');
  };

  const handleClear = () => {
    setVertexAI({
      projectId: null,
      location: 'us-central1',
      serviceAccountJson: null,
    });
    setProjectId('');
    setLocation('us-central1');
    setServiceAccountJson('');
    toast.success('Vertex AI configuration cleared');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        try {
          const parsed = JSON.parse(content);
          setServiceAccountJson(content);
          if (parsed.project_id && !projectId) {
            setProjectId(parsed.project_id);
          }
          toast.success('Service account JSON loaded');
        } catch {
          toast.error('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg border-purple-500/30 bg-purple-500/5">
      <div>
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <span className="text-purple-500">🖼️</span> Vertex AI (Imagen 3)
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Use Google's Imagen 3 models through Vertex AI for high-quality image generation.
          Uses Service Account authentication - no token refresh needed!
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">GCP Project ID</label>
          <Input
            type="text"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="my-project-id"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Location</label>
          <Input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="us-central1"
          />
          <p className="text-xs text-muted-foreground mt-1">Default: us-central1</p>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Service Account JSON</label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-full px-4 py-2 text-sm font-medium border rounded-md bg-background hover:bg-accent hover:text-accent-foreground text-center">
                  📁 Upload JSON Key File
                </div>
              </label>
            </div>
            <div className="relative">
              <textarea
                value={serviceAccountJson}
                onChange={(e) => setServiceAccountJson(e.target.value)}
                placeholder='{"type": "service_account", "project_id": "...", ...}'
                className="w-full h-24 p-2 text-xs font-mono border rounded-md bg-background resize-none"
                style={{ fontFamily: 'monospace' }}
              />
              {serviceAccountJson && (
                <div className="absolute top-1 right-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowJson(!showJson)}
                  >
                    {showJson ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!projectId || !serviceAccountJson}>
            Save Configuration
          </Button>
          {vertexAI?.projectId && (
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="text-sm space-y-2 p-3 bg-muted rounded-md">
        <p className="font-medium">Setup instructions:</p>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs">
          <li>Go to <a href="https://console.cloud.google.com/iam-admin/serviceaccounts" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GCP Service Accounts</a></li>
          <li>Create a service account or select existing one</li>
          <li>Grant it the <strong>"Vertex AI User"</strong> role</li>
          <li>Go to Keys → Add Key → Create new key → JSON</li>
          <li>Upload the downloaded JSON file above</li>
        </ol>
      </div>
    </div>
  );
}

function GeminiImageInstructions() {
  return (
    <div className="space-y-4 p-4 border rounded-lg border-blue-500/30 bg-blue-500/5">
      <div>
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <span className="text-blue-500">🎨</span> Gemini Image Generation
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Gemini 2.0 Flash can generate images using the same API key you use for chat.
        </p>
      </div>

      <div className="text-sm space-y-3 p-3 bg-muted rounded-md">
        <p className="font-medium">How to get started:</p>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>
            Get your API key from{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google AI Studio
            </a>
          </li>
          <li>Enter your Gemini API key above</li>
          <li>Select a Gemini model in the Image Generator</li>
        </ol>
      </div>

      <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
        <p><strong>Supported models:</strong> Gemini 2.0 Flash (Image) and Gemini 2.0 Flash Preview</p>
      </div>
    </div>
  );
}

export function APIKeyInput() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Your API keys are stored locally in your browser and never sent to our servers.
        Add keys for the AI providers you want to use.
      </p>
      <ProviderKeyInput provider="openai" />
      <ProviderKeyInput provider="gemini" />
      <GeminiImageInstructions />
      <VertexAIConfig />
      <ProviderKeyInput provider="claude" />
    </div>
  );
}
