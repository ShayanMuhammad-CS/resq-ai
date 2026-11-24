/**
 * ResQ-AI Firebase Configuration & Client Initialization
 * Supports production Firebase project credentials with offline fallback.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyResQ-DemoApiKey-Hackathon2026',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'resq-ai-hybrid.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'resq-ai-hybrid',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'resq-ai-hybrid.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1029384756',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1029384756:web:9a8b7c6d5e4f',
};

let app: FirebaseApp;
let db: Firestore;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);

  // Enable offline multi-tab persistence in Firestore
  if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
        console.warn('Firestore multi-tab persistence warning: multiple tabs open.');
      } else if (err.code === 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.warn('Firestore persistence not supported in this browser environment.');
      }
    });
  }
} catch (e) {
  console.warn('Firebase client initialization in fallback mode:', e);
}

export { app, db, firebaseConfig };
