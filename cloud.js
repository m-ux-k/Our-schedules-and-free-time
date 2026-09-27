/**
 * cloud.js — Firebase Firestore sync layer
 * -------------------------------------------------------------
 * Loaded as a <script type="module">. Wraps Firestore so the rest of
 * the app (app.js, a plain classic script) can just call window.Cloud
 * without knowing anything about Firebase.
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

    async setOverride(person, state, expiresAtMs) {
      await authReady;
      await setDoc(doc(db, "status", person), {
        state,
        expiresAt: expiresAtMs,
        setAt: Date.now(),
      });
    },

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
