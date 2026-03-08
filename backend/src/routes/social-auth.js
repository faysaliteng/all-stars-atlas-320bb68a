/**
 * Social OAuth Routes — Google & Facebook
 * Verifies provider tokens server-side, creates/finds user, returns JWT
 */
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { generateTokens, formatUser } = require('../middleware/auth');

const router = express.Router();

// ─── Helper: get social OAuth config from system_settings ───
async function getSocialConfig(provider) {
  try {
    const [rows] = await db.query(
      "SELECT setting_value FROM system_settings WHERE setting_key = ?",
      [`social_oauth_${provider}`]
    );
    if (rows.length > 0) return JSON.parse(rows[0].setting_value);
  } catch {}
  return null;
}

// ─── Google Token Verification ───
async function verifyGoogleToken(idToken, clientId) {
  // Use Google's tokeninfo endpoint for verification
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
  if (!res.ok) throw new Error('Invalid Google token');
  const payload = await res.json();

  // Verify audience matches our client ID
  if (payload.aud !== clientId) throw new Error('Token audience mismatch');
  if (!payload.email_verified || payload.email_verified === 'false') throw new Error('Google email not verified');

  return {
    email: payload.email,
    firstName: payload.given_name || '',
    lastName: payload.family_name || '',
    avatar: payload.picture || null,
    providerId: payload.sub,
  };
}

// ─── Facebook Token Verification ───
async function verifyFacebookToken(accessToken, appId, appSecret) {
  // First verify the token is valid for our app
  const debugRes = await fetch(
    `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appId}|${appSecret}`
  );
  if (!debugRes.ok) throw new Error('Invalid Facebook token');
  const debugData = await debugRes.json();

  if (!debugData.data?.is_valid) throw new Error('Facebook token is not valid');
  if (debugData.data.app_id !== appId) throw new Error('Facebook app ID mismatch');

  // Get user profile data
  const profileRes = await fetch(
    `https://graph.facebook.com/me?fields=id,first_name,last_name,email,picture.type(large)&access_token=${accessToken}`
  );
  if (!profileRes.ok) throw new Error('Failed to fetch Facebook profile');
  const profile = await profileRes.json();

  if (!profile.email) throw new Error('Facebook account has no email. Please use an account with a verified email.');

  return {
    email: profile.email,
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    avatar: profile.picture?.data?.url || null,
    providerId: profile.id,
  };
}

// ─── Common: find or create user from social profile ───
async function findOrCreateSocialUser(profile, provider) {
  // Check if user exists by email
  const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [profile.email]);

  if (existing.length > 0) {
    const user = existing[0];
    // Update social provider info if not set
    if (!user.social_provider || user.social_provider !== provider) {
      await db.query(
        'UPDATE users SET social_provider = ?, social_provider_id = ?, avatar = COALESCE(avatar, ?) WHERE id = ?',
        [provider, profile.providerId, profile.avatar, user.id]
      );
    }
    return { user: { ...user, social_provider: provider }, isNewUser: false };
  }

  // Create new user (no password for social users)
  const id = uuidv4();
  await db.query(
    `INSERT INTO users (id, first_name, last_name, email, password_hash, role, social_provider, social_provider_id, avatar, email_verified)
     VALUES (?, ?, ?, ?, '', 'customer', ?, ?, ?, TRUE)`,
    [id, profile.firstName, profile.lastName, profile.email, provider, profile.providerId, profile.avatar]
  );

  const [newRows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return { user: newRows[0], isNewUser: true };
}

// ─── POST /auth/social/google ───
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body; // Google ID token
    if (!credential) {
      return res.status(400).json({ message: 'Google credential required', status: 400 });
    }

    const config = await getSocialConfig('google');
    if (!config?.clientId) {
      return res.status(503).json({ message: 'Google sign-in is not configured. Contact admin.', status: 503 });
    }

    const profile = await verifyGoogleToken(credential, config.clientId);
    const { user, isNewUser } = await findOrCreateSocialUser(profile, 'google');
    const tokens = generateTokens(user);

    // Store refresh token
    await db.query(
      'INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
      [uuidv4(), user.id, tokens.refreshToken]
    );

    const needsIdUpload = !user.id_document_path;

    res.status(isNewUser ? 201 : 200).json({
      user: formatUser(user),
      ...tokens,
      isNewUser,
      needsIdUpload,
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(401).json({ message: err.message || 'Google authentication failed', status: 401 });
  }
});

// ─── POST /auth/social/facebook ───
router.post('/facebook', async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ message: 'Facebook access token required', status: 400 });
    }

    const config = await getSocialConfig('facebook');
    if (!config?.appId || !config?.appSecret) {
      return res.status(503).json({ message: 'Facebook sign-in is not configured. Contact admin.', status: 503 });
    }

    const profile = await verifyFacebookToken(accessToken, config.appId, config.appSecret);
    const { user, isNewUser } = await findOrCreateSocialUser(profile, 'facebook');
    const tokens = generateTokens(user);

    await db.query(
      'INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
      [uuidv4(), user.id, tokens.refreshToken]
    );

    const needsIdUpload = !user.id_document_path;

    res.status(isNewUser ? 201 : 200).json({
      user: formatUser(user),
      ...tokens,
      isNewUser,
      needsIdUpload,
    });
  } catch (err) {
    console.error('Facebook auth error:', err);
    res.status(401).json({ message: err.message || 'Facebook authentication failed', status: 401 });
  }
});

// ─── GET /auth/social/config ─── (returns public client IDs only)
router.get('/config', async (req, res) => {
  try {
    const google = await getSocialConfig('google');
    const facebook = await getSocialConfig('facebook');
    res.json({
      google: { enabled: !!google?.clientId, clientId: google?.clientId || '' },
      facebook: { enabled: !!facebook?.appId, appId: facebook?.appId || '' },
    });
  } catch {
    res.json({ google: { enabled: false, clientId: '' }, facebook: { enabled: false, appId: '' } });
  }
});

module.exports = router;
