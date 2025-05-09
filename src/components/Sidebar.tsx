'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { theme } = useTheme();

  const isActivePath = (path: string) => {
    if (path === '/generate') {
      return pathname === path || pathname.startsWith(`${path}/`);
    }
    return pathname === path;
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-base-100 border-r border-base-200 flex flex-col shadow-sm">
      {/* Logo */}
      <Link href="/" className="p-4 flex items-center gap-2">
        <Image 
          src={theme === 'dark' ? '/images/logos/logo-dark.png' : '/images/logos/logo-light.png'}
          alt="Eadsy Logo"
          width={120}
          height={36}
          className="h-9 w-auto"
        />
      </Link>

      {/* User Profile */}
      <div className="p-4 border-y border-base-200">
        <div className="flex items-center gap-3">
          {user?.photoURL ? (
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/15 shadow-sm">
              <Image
                src={user.photoURL}
                alt={user.displayName || 'Profile'}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/5 text-primary flex items-center justify-center ring-2 ring-primary/15 shadow-sm">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-base-content">{user?.displayName || 'User'}</p>
            <p className="text-sm text-base-content/60 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-3">
          <li>
            <Link
              href="/explore"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActivePath('/explore')
                  ? 'bg-primary/5 text-primary font-medium shadow-sm' 
                  : 'hover:bg-base-200 text-base-content hover:text-primary hover:translate-x-1'
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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActivePath('/generate')
                  ? 'bg-secondary/5 text-secondary font-medium shadow-sm'
                  : 'hover:bg-base-200 text-base-content hover:text-secondary hover:translate-x-1'
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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActivePath('/gallery')
                  ? 'bg-accent/5 text-accent font-medium shadow-sm'
                  : 'hover:bg-base-200 text-base-content hover:text-accent hover:translate-x-1'
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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActivePath('/profile')
                  ? 'bg-primary/5 text-primary font-medium shadow-sm'
                  : 'hover:bg-base-200 text-base-content hover:text-primary hover:translate-x-1'
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
      <div className="p-4 border-t border-base-200">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-base-content/80 hover:text-error hover:bg-error/5 transition-all duration-200"
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