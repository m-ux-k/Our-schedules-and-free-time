/**
 * firebase-config.js
 * -------------------------------------------------------------
 * Paste your own Firebase project's config here. You get this from:
 *   Firebase console → your project → ⚙️ Project settings → General
 *   → "Your apps" → (add a Web app if you haven't) → SDK setup and
 *   configuration → "Config".
 *
 * Until you replace the placeholder values below, the site still
 * works fine on its own — it just runs in "local only" mode: everyone
 * sees schedule-based status, but the "I'm Free / I'm Not Free"
 * buttons and cross-device notifications won't do anything yet.
 * -------------------------------------------------------------
 */

const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

window.FIREBASE_CONFIG = FIREBASE_CONFIG;
