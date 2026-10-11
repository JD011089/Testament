/**
 * Secure Gemini client for Testament
 * Dispatches requests to the serverless /api/gemini endpoint,
 * preventing any exposure of GEMINI_API_KEY in client bundle assets.
 */

export interface GeminiRequestOptions {
  maxTokens?: number;
  maxOutputTokens?: number;
  temperature?: number;
  responseMimeType?: string;
  timeoutMs?: number;
}

export function getUserGeminiKey(): string {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('testament_gemini_api_key');
    if (stored) return stored.trim();
  }
  return '';
}

export async function callServerGemini(
  prompt: string,
  options?: GeminiRequestOptions
): Promise<string | null> {
  const timeoutMs = options?.timeoutMs ?? 15000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const userKey = getUserGeminiKey();
    if (userKey) {
      headers['x-user-gemini-key'] = userKey;
    }

    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt,
        maxTokens: options?.maxTokens,
        responseMimeType: options?.responseMimeType,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    if (data?.text && typeof data.text === 'string') {
      return data.text.trim();
    }
    return null;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}
