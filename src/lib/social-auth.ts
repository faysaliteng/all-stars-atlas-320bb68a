/**
 * Social Authentication — Google & Facebook SDK loaders + popup triggers
 */
import { api } from '@/lib/api';

// ─── Types ───
export interface SocialAuthConfig {
  google: { enabled: boolean; clientId: string };
  facebook: { enabled: boolean; appId: string };
}

interface SocialAuthResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  needsIdUpload: boolean;
}

// ─── Fetch social config from backend ───
let cachedConfig: SocialAuthConfig | null = null;

export async function getSocialAuthConfig(): Promise<SocialAuthConfig> {
  if (cachedConfig) return cachedConfig;
  try {
    cachedConfig = await api.get<SocialAuthConfig>('/auth/social/config');
    return cachedConfig;
  } catch {
    return { google: { enabled: false, clientId: '' }, facebook: { enabled: false, appId: '' } };
  }
}

export function clearSocialConfigCache() {
  cachedConfig = null;
}

// ─── Google Sign-In ───
let googleLoaded = false;

function loadGoogleScript(): Promise<void> {
  if (googleLoaded) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (document.getElementById('google-gsi')) { googleLoaded = true; resolve(); return; }
    const s = document.createElement('script');
    s.id = 'google-gsi';
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = () => { googleLoaded = true; resolve(); };
    s.onerror = () => reject(new Error('Failed to load Google Sign-In'));
    document.head.appendChild(s);
  });
}

export async function signInWithGoogle(): Promise<SocialAuthResponse> {
  const config = await getSocialAuthConfig();
  if (!config.google.enabled || !config.google.clientId) {
    throw new Error('Google sign-in is not configured. Admin must set it up in Settings → Social Login.');
  }

  await loadGoogleScript();
  const google = (window as any).google;
  if (!google?.accounts?.id) throw new Error('Google Identity Services failed to load');

  return new Promise((resolve, reject) => {
    google.accounts.id.initialize({
      client_id: config.google.clientId,
      callback: async (response: any) => {
        if (!response.credential) {
          reject(new Error('Google sign-in was cancelled'));
          return;
        }
        try {
          const result = await api.post<SocialAuthResponse>('/auth/social/google', {
            credential: response.credential,
          });
          resolve(result);
        } catch (err: any) {
          reject(new Error(err?.message || 'Google authentication failed'));
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // Use the One Tap / popup prompt
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback: use the button-based flow
        const btn = document.createElement('div');
        btn.id = 'google-signin-fallback';
        btn.style.position = 'fixed';
        btn.style.top = '-9999px';
        document.body.appendChild(btn);
        google.accounts.id.renderButton(btn, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
        });
        const rendered = btn.querySelector('div[role="button"]') as HTMLElement;
        if (rendered) rendered.click();
        else {
          document.body.removeChild(btn);
          reject(new Error('Google sign-in popup was blocked. Please allow popups for this site.'));
        }
        setTimeout(() => { if (document.getElementById('google-signin-fallback')) document.body.removeChild(btn); }, 60000);
      }
    });
  });
}

// ─── Facebook Sign-In ───
let fbLoaded = false;

function loadFacebookSDK(appId: string): Promise<void> {
  if (fbLoaded) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if ((window as any).FB) { fbLoaded = true; resolve(); return; }
    (window as any).fbAsyncInit = () => {
      (window as any).FB.init({ appId, cookie: true, xfbml: false, version: 'v19.0' });
      fbLoaded = true;
      resolve();
    };
    const s = document.createElement('script');
    s.id = 'facebook-jssdk';
    s.src = 'https://connect.facebook.net/en_US/sdk.js';
    s.async = true;
    s.defer = true;
    s.onerror = () => reject(new Error('Failed to load Facebook SDK'));
    document.head.appendChild(s);
  });
}

export async function signInWithFacebook(): Promise<SocialAuthResponse> {
  const config = await getSocialAuthConfig();
  if (!config.facebook.enabled || !config.facebook.appId) {
    throw new Error('Facebook sign-in is not configured. Admin must set it up in Settings → Social Login.');
  }

  await loadFacebookSDK(config.facebook.appId);
  const FB = (window as any).FB;
  if (!FB) throw new Error('Facebook SDK failed to load');

  return new Promise((resolve, reject) => {
    FB.login(
      async (response: any) => {
        if (response.status !== 'connected' || !response.authResponse?.accessToken) {
          reject(new Error('Facebook sign-in was cancelled'));
          return;
        }
        try {
          const result = await api.post<SocialAuthResponse>('/auth/social/facebook', {
            accessToken: response.authResponse.accessToken,
          });
          resolve(result);
        } catch (err: any) {
          reject(new Error(err?.message || 'Facebook authentication failed'));
        }
      },
      { scope: 'public_profile,email' }
    );
  });
}
