/**
 * Safe JSON parse for fetch responses — avoids "Unexpected end of JSON input"
 * when the body is empty or not JSON (e.g. proxy errors, HTML error pages).
 */
export async function parseResponseJson<T = unknown>(
  res: Response,
): Promise<T | null> {
  const text = await res.text();
  if (!text?.trim()) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
