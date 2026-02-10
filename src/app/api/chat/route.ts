import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

// Gemini API call helper
async function callGeminiAPI(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  stream: boolean,
  options: { temperature?: number; maxTokens?: number }
) {
  // For streaming, add alt=sse parameter
  const streamParam = stream ? '&alt=sse' : '';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${stream ? 'streamGenerateContent' : 'generateContent'}?key=${apiKey}${streamParam}`;

  // Convert messages to Gemini format
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  // Extract system instruction if present
  const systemMessage = messages.find(m => m.role === 'system');

  const requestBody: any = {
    contents,
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 8192,
    },
  };

  if (systemMessage) {
    requestBody.systemInstruction = { parts: [{ text: systemMessage.content }] };
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Gemini API error: ${response.status}`;
    try {
      const error = JSON.parse(errorText);
      errorMessage = error.error?.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response;
}

export async function POST(request: NextRequest) {
  try {
    const openaiKey = request.headers.get('x-api-key');
    const geminiKey = request.headers.get('x-gemini-api-key');
    
    const body = await request.json();
    const { messages, model, stream, temperature, max_tokens, top_p, frequency_penalty, presence_penalty } = body;

    if (!messages || !model) {
      return NextResponse.json({ error: 'Messages and model are required' }, { status: 400 });
    }

    // Determine provider from model name
    const isGemini = model.startsWith('gemini');

    if (isGemini) {
      if (!geminiKey) {
        return NextResponse.json({ error: 'Gemini API key is required' }, { status: 401 });
      }

      if (stream) {
        const response = await callGeminiAPI(geminiKey, model, messages, true, { temperature, maxTokens: max_tokens });
        
        const encoder = new TextEncoder();
        const reader = response.body?.getReader();
        
        const customStream = new ReadableStream({
          async start(controller) {
            if (!reader) {
              controller.close();
              return;
            }
            
            const decoder = new TextDecoder();
            let buffer = '';
            
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                
                // Parse SSE format: data: {...}\n\n
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                
                for (const line of lines) {
                  const trimmed = line.trim();
                  // Handle SSE format
                  if (trimmed.startsWith('data: ')) {
                    const jsonStr = trimmed.slice(6);
                    if (jsonStr && jsonStr !== '[DONE]') {
                      try {
                        const parsed = JSON.parse(jsonStr);
                        if (parsed.candidates?.[0]?.content?.parts?.[0]?.text) {
                          const text = parsed.candidates[0].content.parts[0].text;
                          const chunk = {
                            choices: [{ delta: { content: text } }],
                          };
                          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
                        }
                      } catch {
                        // Ignore parsing errors for partial chunks
                      }
                    }
                  }
                  // Handle raw JSON format (fallback)
                  else if (trimmed.startsWith('{')) {
                    try {
                      const parsed = JSON.parse(trimmed.replace(/^,/, '').replace(/^\[/, '').replace(/\]$/, ''));
                      if (parsed.candidates?.[0]?.content?.parts?.[0]?.text) {
                        const text = parsed.candidates[0].content.parts[0].text;
                        const chunk = {
                          choices: [{ delta: { content: text } }],
                        };
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
                      }
                    } catch {
                      // Ignore parsing errors
                    }
                  }
                }
              }
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            } catch (error) {
              controller.error(error);
            }
          },
        });

        return new NextResponse(customStream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } else {
        const response = await callGeminiAPI(geminiKey, model, messages, false, { temperature, maxTokens: max_tokens });
        const data = await response.json();
        
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        return NextResponse.json({
          message: {
            id: `gemini-${Date.now()}`,
            role: 'assistant',
            content,
            timestamp: Date.now(),
            model,
          },
          usage: data.usageMetadata ? {
            prompt_tokens: data.usageMetadata.promptTokenCount,
            completion_tokens: data.usageMetadata.candidatesTokenCount,
            total_tokens: data.usageMetadata.totalTokenCount,
          } : undefined,
        });
      }
    }

    // OpenAI models
    if (!openaiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 401 });
    }

    const openai = new OpenAI({ apiKey: openaiKey });

    if (stream) {
      const completion = await openai.chat.completions.create({
        model,
        messages,
        stream: true,
        temperature,
        max_tokens,
        top_p,
        frequency_penalty,
        presence_penalty,
      });

      const encoder = new TextEncoder();
      const customStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of completion) {
              const text = `data: ${JSON.stringify(chunk)}\n\n`;
              controller.enqueue(encoder.encode(text));
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new NextResponse(customStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      const completion = await openai.chat.completions.create({
        model,
        messages,
        stream: false,
        temperature,
        max_tokens,
        top_p,
        frequency_penalty,
        presence_penalty,
      });

      return NextResponse.json({
        message: {
          id: completion.id,
          role: 'assistant',
          content: completion.choices[0].message.content,
          timestamp: Date.now(),
          model: completion.model,
        },
        usage: completion.usage,
      });
    }
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    );
  }
}
