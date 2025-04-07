'use client';

import { useAuth } from '@/context/AuthContext';
import { FcGoogle } from 'react-icons/fc';

export default function LoginButton() {
  const { signInWithGoogle } = useAuth();

  return (
    <button
      onClick={signInWithGoogle}
      className="btn rounded-full px-8 normal-case text-base font-medium hover:scale-105 transition-transform bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center gap-2"
    >
      <FcGoogle className="w-5 h-5" />
      Sign in with Google
    </button>
  );
} 