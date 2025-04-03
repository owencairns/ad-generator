import * as admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["project_id", "private_key", "client_email"] as const;
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const serviceAccount: ServiceAccount = {
  projectId: process.env.project_id!,
  privateKey: process.env.private_key!.replace(/\\n/g, "\n"),
  clientEmail: process.env.client_email!,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "ad-generator-570e6.firebasestorage.app",
  });
}

export const db = admin.firestore();
export const storage = admin.storage();
export default admin;
