/**
 * Production logging utility that shields console messages,
 * blocks sensitive credentials, and filters out non-critical alerts.
 */

const isProd = import.meta.env.PROD;

// Helper to mask potential sensitive strings (like auth tokens or keys)
const maskSensitiveData = (arg) => {
  if (typeof arg === 'string') {
    // Mask potential token/key patterns
    return arg
      .replace(/AIzaSy[A-Za-z0-9_-]{33}/g, '[MASKED_FIREBASE_KEY]') // Firebase API key
      .replace(/[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g, '[MASKED_JWT]'); // JWT Token
  }
  if (arg && typeof arg === 'object') {
    try {
      const maskedObj = { ...arg };
      for (const key in maskedObj) {
        if (/key|token|password|auth|secret|credential/i.test(key)) {
          maskedObj[key] = '[MASKED]';
        } else if (typeof maskedObj[key] === 'object') {
          maskedObj[key] = maskSensitiveData(maskedObj[key]);
        }
      }
      return maskedObj;
    } catch {
      return '[Circular Object]';
    }
  }
  return arg;
};

export const logger = {
  debug: (...args) => {
    if (!isProd) {
      console.log('[Melody DEBUG]:', ...args.map(maskSensitiveData));
    }
  },
  info: (...args) => {
    if (!isProd) {
      console.info('[Melody INFO]:', ...args.map(maskSensitiveData));
    }
  },
  warn: (...args) => {
    console.warn('[Melody WARN]:', ...args.map(maskSensitiveData));
  },
  error: (...args) => {
    // In production, you would report this to a monitoring service (Sentry, LogRocket, etc.)
    console.error('[Melody ERROR]:', ...args.map(maskSensitiveData));
  }
};
