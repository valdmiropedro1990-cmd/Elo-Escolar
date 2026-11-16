import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Internal Admin Password for legacy auth mapping
export const INTERNAL_ADMIN_PASSWORD = 'admin_password_123';

// Check for valid API key before initializing
const hasConfig = typeof firebaseConfig.apiKey === 'string' && firebaseConfig.apiKey.length > 5;

let app;

if (hasConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  // Silent warning for optional Firebase
  if (process.env.NODE_ENV === 'development') {
    console.log("Firebase is not configured (optional). Skipping initialization.");
  }
}

export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
