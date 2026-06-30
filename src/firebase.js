import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  ReCaptchaEnterpriseProvider
} from "firebase/app-check";
import { logger } from "./utils/logger";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Guard: log a clear warning if env vars are missing (common cause of blank screen on deploy)
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined') {
  logger.error(
    'Firebase env vars are missing. ' +
    'Add VITE_FIREBASE_* variables to your Vercel project settings and redeploy.'
  );
}

const app = initializeApp(firebaseConfig);

// Initialize Firebase App Check
let appCheck = null;
if (typeof window !== "undefined") {
  // If we are developing locally, enable App Check debugging
  if (import.meta.env.DEV) {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true;
  }

  // Use a fallback dummy key in local development if the developer hasn't configured one yet.
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || (import.meta.env.DEV ? 'local-debug-dummy-site-key' : null);
  if (siteKey) {
    const isEnterprise = import.meta.env.VITE_USE_RECAPTCHA_ENTERPRISE === 'true';
    const provider = isEnterprise
      ? new ReCaptchaEnterpriseProvider(siteKey)
      : new ReCaptchaV3Provider(siteKey);

    appCheck = initializeAppCheck(app, {
      provider,
      isTokenAutoRefreshEnabled: true,
    });
  } else {
    logger.warn(
      "App Check reCAPTCHA Site Key (VITE_RECAPTCHA_SITE_KEY) is missing. " +
      "App Check is not initialized in production."
    );
  }
}

export { appCheck };
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();

