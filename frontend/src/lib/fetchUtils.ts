const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT = 15_000; // 15s

export async function fetchWithRetry<T>(
  url: string,
  options: { retries?: number; signal?: AbortSignal; timeout?: number } = {},
): Promise<T> {
  const { retries = MAX_RETRIES, signal, timeout = DEFAULT_TIMEOUT } = options;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Combine caller's signal with per-request timeout
      const timeoutSignal = AbortSignal.timeout(timeout);
      const combinedSignal = signal
        ? AbortSignal.any([signal, timeoutSignal])
        : timeoutSignal;

      const res = await fetch(url, { signal: combinedSignal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      // If the caller aborted, don't retry
      if (signal?.aborted) throw error;
      if (attempt === retries - 1) throw error;
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    }
  }
  throw new Error('fetchWithRetry: exhausted retries');
}
