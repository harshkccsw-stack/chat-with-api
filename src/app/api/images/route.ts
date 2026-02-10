import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

// Gemini models with native image generation
const GEMINI_IMAGE_MODELS = [
  'gemini-2.0-flash-exp-image-generation',
  'gemini-2.0-flash-preview-image-generation',
];

// Vertex AI Imagen models
const IMAGEN_MODELS = [
  'imagen-3.0-generate-002',
  'imagen-3.0-fast-generate-001',
];

// Base64 URL encoding helper
function base64UrlEncode(str: string): string {
  const base64 = btoa(str);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Convert ArrayBuffer to base64url
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return base64UrlEncode(binary);
}

// Generate JWT for service account authentication
async function generateServiceAccountToken(serviceAccountJson: string): Promise<string> {
  const serviceAccount = JSON.parse(serviceAccountJson);
  
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600; // 1 hour
  
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };
  
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: expiry,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
  };
  
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${headerB64}.${payloadB64}`;
  
  // Import the private key
  const pemContents = serviceAccount.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s/g, '');
  
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  // Sign the token
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );
  
  const signatureB64 = arrayBufferToBase64Url(signature);
  const jwt = `${unsignedToken}.${signatureB64}`;
  
  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  
  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`Failed to get access token: ${errorText}`);
  }
  
  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

async function generateWithImagen(
  projectId: string,
  location: string,
  serviceAccountJson: string,
  prompt: string,
  model: string,
  aspectRatio: string = '1:1'
) {
  // Generate access token from service account
  const accessToken = await generateServiceAccountToken(serviceAccountJson);
  
  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      instances: [
        {
          prompt: prompt,
        },
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: aspectRatio,
        personGeneration: 'allow_adult',
        safetySetting: 'block_some',
      },
    }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    let errorMessage = 'Imagen API error';
    try {
      const error = JSON.parse(responseText);
      errorMessage = error.error?.message || JSON.stringify(error) || errorMessage;
    } catch {
      errorMessage = responseText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
  }

  const images: { url: string; revised_prompt?: string }[] = [];

  // Extract images from Imagen response
  for (const prediction of data.predictions || []) {
    if (prediction.bytesBase64Encoded) {
      images.push({
        url: `data:image/png;base64,${prediction.bytesBase64Encoded}`,
        revised_prompt: prompt,
      });
    }
    // Check for RAI (Responsible AI) filtered content
    if (prediction.raiFilteredReason) {
      throw new Error(`Image blocked by safety filter: ${prediction.raiFilteredReason}`);
    }
  }

  if (images.length === 0) {
    // Check for any blocking reasons in the response
    const blockReason = data.predictions?.[0]?.safetyAttributes?.blocked 
      ? 'Content blocked by safety filters' 
      : data.promptFeedback?.blockReason || 'No images generated. The model may have rejected the prompt.';
    throw new Error(blockReason);
  }

  return { images, created: Math.floor(Date.now() / 1000) };
}

async function generateWithGemini(
  apiKey: string,
  prompt: string,
  model: string
) {
  const baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  const endpoint = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    let errorMessage = 'Gemini API error';
    try {
      const error = JSON.parse(responseText);
      const msg = error.error?.message || '';

      if (msg.includes('not found') || msg.includes('does not exist')) {
        errorMessage = `Model ${model} not found. Try a different model.`;
      } else if (msg.includes('permission') || msg.includes('denied') || msg.includes('blocked')) {
        errorMessage = 'Access denied. This model may not be available for your API key.';
      } else if (msg.includes('quota') || msg.includes('limit')) {
        errorMessage = 'API quota exceeded. Please try again later.';
      } else {
        errorMessage = msg || JSON.stringify(error.error) || errorMessage;
      }
    } catch {
      errorMessage = responseText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  if (!responseText) {
    throw new Error('Empty response from Gemini API');
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
  }

  const images: { url: string; revised_prompt?: string }[] = [];

  // Extract images from Gemini response
  for (const candidate of data.candidates || []) {
    for (const part of candidate.content?.parts || []) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        images.push({
          url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
          revised_prompt: prompt,
        });
      }
    }
  }

  if (images.length === 0) {
    // Check for text response or error
    let textResponse = '';
    for (const candidate of data.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.text) {
          textResponse += part.text;
        }
      }
    }
    throw new Error(
      textResponse || 'No images generated. The model may have rejected the prompt or returned text only.'
    );
  }

  return { images, created: Math.floor(Date.now() / 1000) };
}

export async function POST(request: NextRequest) {
  try {
    const openaiApiKey = request.headers.get('x-api-key');
    const geminiApiKey = request.headers.get('x-gemini-api-key');
    const vertexProjectId = request.headers.get('x-vertex-project-id');
    const vertexLocation = request.headers.get('x-vertex-location') || 'us-central1';

    const body = await request.json();
    const { prompt, model, size, quality, style, n, vertexServiceAccount } = body;

    // Convert size to aspect ratio for Imagen
    const getAspectRatio = (sizeStr: string) => {
      if (sizeStr === '1024x1024' || sizeStr === '1536x1536') return '1:1';
      if (sizeStr === '1024x1792' || sizeStr === '768x1344') return '9:16';
      if (sizeStr === '1792x1024' || sizeStr === '1344x768') return '16:9';
      if (sizeStr === '1024x1536') return '3:4';
      if (sizeStr === '1536x1024') return '4:3';
      return '1:1';
    };

    console.log('Image generation request:', { 
      model, 
      hasGeminiKey: !!geminiApiKey,
      hasOpenAIKey: !!openaiApiKey,
      hasVertexConfig: !!(vertexProjectId && vertexServiceAccount),
      isGeminiModel: model.startsWith('gemini-'),
      isImagenModel: IMAGEN_MODELS.includes(model),
    });

    if (!prompt || !model) {
      return NextResponse.json(
        { error: 'Prompt and model are required' },
        { status: 400 }
      );
    }

    // Check if it's an Imagen model (Vertex AI)
    const isImagenModel = IMAGEN_MODELS.includes(model);
    
    if (isImagenModel) {
      if (!vertexProjectId || !vertexServiceAccount) {
        return NextResponse.json(
          {
            error: 'Vertex AI configuration required for Imagen. Please add Project ID and Service Account JSON in settings.',
          },
          { status: 401 }
        );
      }

      const aspectRatio = getAspectRatio(size);
      const result = await generateWithImagen(
        vertexProjectId,
        vertexLocation,
        vertexServiceAccount,
        prompt,
        model,
        aspectRatio
      );
      return NextResponse.json(result);
    }

    // Check if it's a Gemini image model
    const isGeminiModel = model.startsWith('gemini-');

    if (isGeminiModel) {
      if (!geminiApiKey || geminiApiKey.trim() === '') {
        return NextResponse.json(
          {
            error: `Gemini API key required for model "${model}". Please add your Gemini API key in settings.`,
          },
          { status: 401 }
        );
      }

      const result = await generateWithGemini(geminiApiKey, prompt, model);
      return NextResponse.json(result);
    }

    // OpenAI models (DALL-E)
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is required' },
        { status: 401 }
      );
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    const response = await openai.images.generate({
      model,
      prompt,
      size: size as any,
      quality: quality as any,
      style: style as any,
      n: n || 1,
    });

    return NextResponse.json({
      images: (response.data || []).map((img) => ({
        url: img.url,
        revised_prompt: img.revised_prompt,
      })),
      created: response.created,
    });
  } catch (error: any) {
    console.error('Image generation API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    );
  }
}
