import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { ServiceAccount } from "firebase-admin/app";

// Initialize Firebase Admin
const apps = getApps();

// Debug logging for environment variables
console.log("Firebase Admin Initialization:");
console.log("FIREBASE_PROJECT_ID exists:", !!process.env.FIREBASE_PROJECT_ID);
console.log(
  "FIREBASE_CLIENT_EMAIL exists:",
  !!process.env.FIREBASE_CLIENT_EMAIL
);
console.log("FIREBASE_PRIVATE_KEY exists:", !!process.env.FIREBASE_PRIVATE_KEY);
console.log(
  "FIREBASE_STORAGE_BUCKET exists:",
  !!process.env.FIREBASE_STORAGE_BUCKET
);

// Ensure the environment variables are properly set
if (!process.env.FIREBASE_PROJECT_ID) {
  throw new Error(
    "FIREBASE_PROJECT_ID is not defined in environment variables"
  );
}

// Create a properly typed service account
const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

const firebaseAdmin =
  apps.length === 0
    ? initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      })
    : apps[0];

export const adminDb = getFirestore();
export const adminStorage = getStorage();

export default firebaseAdmin;
