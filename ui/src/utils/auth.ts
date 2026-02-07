const DEFAULT_POW_DIFFICULTY = 3;
let cachedDifficulty = null;

async function getPowDifficulty(): Promise<number> {
  if (cachedDifficulty) return cachedDifficulty;

  try {
    const res = await fetch('/api/auth/config');
    const { powDifficulty } = await res.json();
    cachedDifficulty = powDifficulty ?? DEFAULT_POW_DIFFICULTY;
    return cachedDifficulty;
  } catch {
    return DEFAULT_POW_DIFFICULTY;
  }
}

/**
 * Create a hash challenge from the request details
 */
async function createChallenge(method: string, url: string, timestamp: string): Promise<string> {
  const urlObj = new URL(url, window.location.origin);
  const data = `${method.toUpperCase()}|${urlObj.pathname}${urlObj.search}|${timestamp}`;

  const dataBuffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = new Uint8Array(hashBuffer);

  return Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Solve proof-of-work puzzle using Web Worker
 */
async function solvePOW(challenge: string, difficulty: number): Promise<{ nonce: string; hash: string }> {
  const workerCode = `
    self.onmessage = async function(e) {
      const { challenge, difficulty } = e.data;
      const prefix = '0'.repeat(difficulty);
      const encoder = new TextEncoder();

      for (let nonce = 0; nonce < 10000000; nonce++) {
        const data = encoder.encode(challenge + nonce);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hash = Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        if (hash.startsWith(prefix)) {
          self.postMessage({ nonce: nonce.toString(), hash });
          return;
        }
      }

      self.postMessage({ error: 'Failed to solve POW' });
    };
  `;

  return new Promise((resolve, reject) => {
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));

    worker.onmessage = (e) => {
      worker.terminate();
      if (e.data.error) {
        reject(new Error(e.data.error));
      } else {
        resolve(e.data);
      }
    };

    worker.onerror = (error) => {
      worker.terminate();
      reject(new Error('POW worker failed: ' + error.message));
    };

    worker.postMessage({ challenge, difficulty });
  });
}

/**
 * Make authenticated fetch request with POW
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const difficulty = await getPowDifficulty();
  if (difficulty === 0) {
    return fetch(url, options); // POW is disabled, so just fetch the URL
  }

  const method = options.method || 'GET';
  const timestamp = Math.floor(Date.now() / 1000).toString();

  // Create and solve challenge
  const challenge = await createChallenge(method, url, timestamp);
  const { nonce, hash } = await solvePOW(challenge, difficulty);

  // Add auth headers
  const headers = {
    ...options.headers,
    'X-POW-Nonce': nonce,
    'X-POW-Hash': hash,
    'X-POW-Timestamp': timestamp,
  };

  return fetch(url, { ...options, headers });
}