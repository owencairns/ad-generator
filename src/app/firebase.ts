import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  projectId: "ad-generator-570e6",
  storageBucket: "ad-generator-570e6.appspot.com",
  apiKey: "AIzaSyCGL04jYUx6O4qCT6M2GYeHTjO2gt62s_U", // Required for client-side Firebase
};

// Initialize Firebase only if it hasn't been initialized
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
