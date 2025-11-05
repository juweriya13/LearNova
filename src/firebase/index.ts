'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/* ---------------------------------------------------------------------------
   🚀 Initialize Firebase Safely (Next.js + Firebase Studio compatible)
--------------------------------------------------------------------------- */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    // ⛔ Prevent Firebase from running during SSR
    return {
      firebaseApp: null,
      auth: null,
      firestore: null,
    };
  }

  // ✅ Initialize only once (Next.js hot-reload safe)
  const firebaseApp: FirebaseApp =
    getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

  return getSdks(firebaseApp);
}

/* ---------------------------------------------------------------------------
   🧩 Helper to Retrieve SDKs
--------------------------------------------------------------------------- */
export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
  };
}

/* ---------------------------------------------------------------------------
   ⚙️ Lazy Helpers (no crash if used before init)
--------------------------------------------------------------------------- */
export function getFirebaseAuth(): Auth {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getAuth(app);
}

export function getFirebaseFirestore(): Firestore {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getFirestore(app);
}

/* ---------------------------------------------------------------------------
   📦 Conflict-free exports of hooks and utilities
--------------------------------------------------------------------------- */
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { FirestorePermissionError } from './errors';
export * from './error-emitter';
export * from './client-provider';
export * from './provider';
export * from './non-blocking-login';
export * from './non-blocking-updates';

/* ---------------------------------------------------------------------------
   🧠 Royal Notes
--------------------------------------------------------------------------- */
/**
 * ✅  Use like:
 *     const { firestore } = initializeFirebase();
 *     const auth = getFirebaseAuth();
 *
 * 🔹 Works in Firebase Studio & Next.js.
 * 🔹 Prevents “No Firebase App” runtime errors.
 * 🔹 Only initializes once per client session.
 */
