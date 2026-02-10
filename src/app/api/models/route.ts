import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

async function validateGeminiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    // Basic format check - Gemini API keys are typically 39 characters
    if (!apiKey || apiKey.length < 20) {
      return { valid: false, error: 'API key too short' };
    }

    // Try listing models first (less restrictive)
    const listResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { method: 'GET' }
    );
    
    if (listResponse.ok) {
      return { valid: true };
    }

    // If listing fails, try generateContent
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hi' }] }],
          generationConfig: { maxOutputTokens: 1 }
        })
      }
    );
    
    if (response.ok) {
      return { valid: true };
    }
    
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
    
    // Only reject for clear auth errors
    if (response.status === 401 || 
        errorMessage.includes('API key not valid') || 
        errorMessage.includes('API_KEY_INVALID')) {
      console.log('Gemini validation failed:', errorMessage);
      return { valid: false, error: errorMessage };
    }
    
    // For other errors (blocked, quota, region, etc.), accept the key
    // The user will see the actual error when they try to chat
    console.log('Gemini validation warning (accepting key):', errorMessage);
    return { valid: true };
  } catch (e: any) {
    console.log('Gemini validation exception:', e.message);
    // Accept the key on network errors - let the user try
    return { valid: true };
  }
}
async function validateClaudeKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hi' }],
      }),
    });
    // API key is valid if we get 200 or any response that's not 401/403
    return response.status !== 401 && response.status !== 403;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    const provider = request.nextUrl.searchParams.get('provider') || 'openai';
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 401 });
    }

    // Validate based on provider
    if (provider === 'gemini') {
      const result = await validateGeminiKey(apiKey);
      if (!result.valid) {
        return NextResponse.json({ error: result.error || 'Invalid Gemini API key' }, { status: 401 });
      }
      return NextResponse.json({ valid: true, provider: 'gemini' });
    }

    if (provider === 'claude') {
      const isValid = await validateClaudeKey(apiKey);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid Claude API key' }, { status: 401 });
      }
      return NextResponse.json({ valid: true, provider: 'claude' });
    }

    // Default: OpenAI
    const openai = new OpenAI({ apiKey });
    const models = await openai.models.list();

    return NextResponse.json({
      models: models.data,
    });
  } catch (error: any) {
    console.error('Models API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    );
  }
}
