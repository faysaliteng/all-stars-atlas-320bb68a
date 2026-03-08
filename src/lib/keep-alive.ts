import { config } from './config';

const PING_INTERVAL = 4 * 60 * 1000; // 4 minutes
let intervalId: ReturnType<typeof setInterval> | null = null;

async function ping() {
  try {
    await fetch(`${config.apiBaseUrl}/health`, {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Silent fail — next ping will retry
  }
}

export function startKeepAlive() {
  if (intervalId) return;
  // Initial ping on startup
  ping();
  intervalId = setInterval(ping, PING_INTERVAL);
}

export function stopKeepAlive() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
