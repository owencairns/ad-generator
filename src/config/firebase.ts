// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-9fZk592PG8l1wwLQnrRYAC40K00h_kg",
  authDomain: "ad-generator-570e6.firebaseapp.com",
  projectId: "ad-generator-570e6",
  storageBucket: "ad-generator-570e6.firebasestorage.app",
  messagingSenderId: "507916873599",
  appId: "1:507916873599:web:37f5d0dec74de0a78af44a",
  measurementId: "G-8PGFM5Q3B6",
};

// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { app, auth };
