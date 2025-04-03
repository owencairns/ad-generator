'use client';

import { useAuth } from '@/context/AuthContext';
import { FcGoogle } from 'react-icons/fc';

export default function LoginButton() {
  const { signInWithGoogle } = useAuth();

  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <FcGoogle className="w-5 h-5" />
      Sign in with Google
    </button>
  );
} 