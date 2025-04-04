'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActivePath = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-base-200 border-r border-base-300 flex flex-col">
      {/* Logo */}
      <Link href="/" className="p-4 flex items-center gap-2">
        <span className="text-xl font-bold">
          <span className="text-primary">Ad</span>
          <span className="text-base-content">Generator</span>
        </span>
      </Link>

      {/* User Profile */}
      <div className="p-4 border-y border-base-300">
        <div className="flex items-center gap-3">
          {user?.photoURL ? (
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-base-300">
              <Image
                src={user.photoURL}
                alt={user.displayName || 'Profile'}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border-2 border-base-300">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user?.displayName || 'User'}</p>
            <p className="text-sm text-base-content/70 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Link
              href="/explore"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActivePath('/explore')
                  ? 'bg-primary text-primary-content'
                  : 'hover:bg-base-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Explore
            </Link>
          </li>
          <li>
            <Link
              href="/generate"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActivePath('/generate')
                  ? 'bg-primary text-primary-content'
                  : 'hover:bg-base-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Generate
            </Link>
          </li>
          <li>
            <Link
              href="/gallery"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActivePath('/gallery')
                  ? 'bg-primary text-primary-content'
                  : 'hover:bg-base-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Gallery
            </Link>
          </li>
          <li>
            <Link
              href="/profile"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActivePath('/profile')
                  ? 'bg-primary text-primary-content'
                  : 'hover:bg-base-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </Link>
          </li>
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-base-300">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-error hover:bg-base-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
} 