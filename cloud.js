/**
 * cloud.js — Firebase Firestore sync layer
 * -------------------------------------------------------------
 * Loaded as a <script type="module">. Wraps Firestore so the rest of
 * the app (app.js, a plain classic script) can just call window.Cloud
 * without knowing anything about Firebase.
 *
 * If firebase-config.js still has placeholder values, window.Cloud is
 * left as null and the app falls back to schedule-only mode — nothing
 * breaks, the toggle buttons just get disabled with an explanatory
 * title/tooltip.
 *
 * Firestore layout:
 *   collection "status"
 *     doc <PersonName>
 *       state:     "free" | "busy" | null   (null/missing = no override)
 *       expiresAt: number (ms since epoch) — when this override should
 *                  stop applying; the app itself checks this, nothing
 *                  server-side deletes it, so stale docs are harmless.
 *       setAt:     number (ms since epoch) — used to detect "someone
 *                  just pressed the button" for notifications.
 * -------------------------------------------------------------
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

(function setup() {
  const cfg = window.FIREBASE_CONFIG;
  const configured = cfg && cfg.apiKey && cfg.apiKey !== "YOUR_API_KEY_HERE";

  if (!configured) {
    window.Cloud = null;
    return;
  }

  let db, auth;
  let authReady = new Promise((resolve) => {
    try {
      const app = initializeApp(cfg);
      db = getFirestore(app);
      auth = getAuth(app);

      onAuthStateChanged(auth, (user) => {
        if (user) resolve(user);
      });

      signInAnonymously(auth).catch((err) => {
        console.error("Anonymous sign-in failed:", err);
      });
    } catch (err) {
      console.error("Firebase failed to initialize:", err);
      window.Cloud = null;
      resolve(null);
    }
  });

  window.Cloud = {
    subscribeStatus(callback) {
      return onSnapshot(
        collection(db, "status"),
        (snap) => {
          const out = {};
          snap.forEach((d) => {
            out[d.id] = d.data();
          });
          callback(out);
        },
        (err) => console.error("Cloud sync error:", err)
      );
    },

    /** Sets a manual override for `person`. state is "free" or "busy". */
    async setOverride(person, state, expiresAtMs) {
      await authReady; // wait until anonymous sign-in has completed
      await setDoc(doc(db, "status", person), {
        state,
        expiresAt: expiresAtMs,
        setAt: Date.now(),
      });
    },

    /** Clears the override, reverting that person to schedule-only status. */
    async clearOverride(person) {
      await authReady;
      await setDoc(doc(db, "status", person), {
        state: null,
        expiresAt: null,
        setAt: Date.now(),
      });
    },
  };
})();
