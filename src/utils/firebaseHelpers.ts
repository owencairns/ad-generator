import {
  doc,
  getFirestore,
  updateDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { UserProfile } from "@/types/userTypes";

/**
 * Helper function to save user data to Firestore, ensuring correct nested object structure
 * This resolves issues with nested objects like business and company information
 */
export const saveUserData = async (
  userId: string,
  userData: Partial<UserProfile>,
  options: {
    onboardingCompleted?: boolean;
    merge?: boolean;
  } = {}
): Promise<void> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  console.log("Saving user data:", userData);

  const db = getFirestore();
  const userDocRef = doc(db, "users", userId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataToSave: Record<string, any> = {
    lastUpdated: serverTimestamp(),
  };

  // Set onboarding completed flag if provided
  if (options.onboardingCompleted !== undefined) {
    dataToSave.onboardingCompleted = options.onboardingCompleted;
  }

  // Handle basic fields
  if (userData.displayName !== undefined)
    dataToSave.displayName = userData.displayName;
  if (userData.phoneNumber !== undefined)
    dataToSave.phoneNumber = userData.phoneNumber;
  if (userData.bio !== undefined) dataToSave.bio = userData.bio;
  if (userData.email !== undefined) dataToSave.email = userData.email;
  if (userData.theme !== undefined) dataToSave.theme = userData.theme;

  // Handle company information
  if (userData.company) {
    dataToSave.company = {};
    if (userData.company.name !== undefined)
      dataToSave.company.name = userData.company.name;
    if (userData.company.website !== undefined)
      dataToSave.company.website = userData.company.website;
    if (userData.company.industry !== undefined)
      dataToSave.company.industry = userData.company.industry;
    if (userData.company.size !== undefined)
      dataToSave.company.size = userData.company.size;
    if (userData.company.founded !== undefined)
      dataToSave.company.founded = userData.company.founded;
    if (userData.company.location !== undefined)
      dataToSave.company.location = userData.company.location;
  }

  // Handle business information
  if (userData.business) {
    dataToSave.business = {};
    if (userData.business.products !== undefined)
      dataToSave.business.products = userData.business.products;
    if (userData.business.targetAudience !== undefined)
      dataToSave.business.targetAudience = userData.business.targetAudience;
    if (userData.business.goals !== undefined)
      dataToSave.business.goals = userData.business.goals;
    if (userData.business.adFrequency !== undefined)
      dataToSave.business.adFrequency = userData.business.adFrequency;
  }

  // Handle preferences if needed
  if (userData.preferences) {
    dataToSave.preferences = userData.preferences;
  }

  console.log("Data being saved to Firestore:", dataToSave);

  // Use updateDoc for existing users, setDoc with merge for new users
  if (options.merge) {
    await setDoc(userDocRef, dataToSave, { merge: true });
  } else {
    await updateDoc(userDocRef, dataToSave);
  }

  console.log("User data saved successfully");
};
