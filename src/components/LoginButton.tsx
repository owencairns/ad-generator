'use client';

import { useAuth } from '@/context/AuthContext';
import { FcGoogle } from 'react-icons/fc';

export default function LoginButton() {
  const { signInWithGoogle } = useAuth();

  return (
    <button
      onClick={signInWithGoogle}
      className="w-full btn px-6 py-2 flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
    >
      <FcGoogle className="w-5 h-5" />
      <span className="font-medium text-sm">Sign in with Google</span>
    </button>
  );
} 