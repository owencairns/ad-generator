'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <div className="bg-base-100 border-b border-base-300 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 font-bold text-xl">
          <span className="text-primary">Ad</span>
          <span className="text-base-content">Generator</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <nav className="flex items-center space-x-8 text-base-content/80">
            <Link href="/" className="hover:text-base-content transition-colors">Home</Link>
            <Link href="/explore" className="hover:text-base-content transition-colors">Explore</Link>
            {user && (
              <>
                <Link href="/generate" className="hover:text-base-content transition-colors">Generate</Link>
                <Link href="/gallery" className="hover:text-base-content transition-colors">Gallery</Link>
              </>
            )}
          </nav>

          {/* User Profile or CTA */}
          <div className="flex items-center">
            {loading ? (
              <span className="w-8 h-8 flex items-center justify-center">
                <span className="loading loading-spinner loading-sm text-primary"></span>
              </span>
            ) : user ? (
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="cursor-pointer">
                  {user.photoURL ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-base-300">
                      <Image
                        src={user.photoURL}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border-2 border-base-300">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <ul tabIndex={0} className="dropdown-content menu shadow bg-base-100 rounded-md border border-base-300 w-52 p-2 mt-2">
                  <li>
                    <Link href="/profile" className="py-2 hover:bg-base-200">Profile</Link>
                  </li>
                  <li>
                    <button onClick={logout} className="py-2 bg-error hover:bg-red-600 text-white w-full text-left">Logout</button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link href="/login" className="btn btn-primary">
                Get Started
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="flex md:hidden">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <ul tabIndex={0} className="dropdown-content menu shadow bg-base-100 rounded-md border border-base-300 w-52 p-2 mt-2">
              <li><Link href="/" className="py-2 hover:bg-base-200">Home</Link></li>
              <li><Link href="/explore" className="py-2 hover:bg-base-200">Explore</Link></li>
              {user ? (
                <>
                  <li><Link href="/generate" className="py-2 hover:bg-base-200">Generate Ads</Link></li>
                  <li><Link href="/profile" className="py-2 hover:bg-base-200">Profile</Link></li>
                  <li><Link href="/gallery" className="py-2 hover:bg-base-200">Gallery</Link></li>
                  <li><button onClick={logout} className="py-2 hover:bg-base-200 w-full text-left">Logout</button></li>
                </>
              ) : (
                <li>
                  <Link href="/login" className="py-2 hover:bg-base-200">Get Started</Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 