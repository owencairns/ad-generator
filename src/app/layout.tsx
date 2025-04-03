'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthContextProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

// Navbar component with conditional rendering based on authentication
const Navbar = () => {
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
            <Link href="/generate" className="hover:text-base-content transition-colors">Generate Ads</Link>
            <Link href="/brainstorm" className="hover:text-base-content transition-colors">Brainstorm</Link>
            <Link href="/about" className="hover:text-base-content transition-colors">About</Link>
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
                    <Link href="/dashboard" className="py-2 hover:bg-base-200">Dashboard</Link>
                  </li>
                  <li>
                    <button onClick={logout} className="py-2 hover:bg-base-200 w-full text-left">Logout</button>
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
              <li><Link href="/generate" className="py-2 hover:bg-base-200">Generate Ads</Link></li>
              <li><Link href="/brainstorm" className="py-2 hover:bg-base-200">Brainstorm</Link></li>
              <li><Link href="/about" className="py-2 hover:bg-base-200">About</Link></li>
              {user && (
                <>
                  <li><Link href="/profile" className="py-2 hover:bg-base-200">Profile</Link></li>
                  <li><Link href="/dashboard" className="py-2 hover:bg-base-200">Dashboard</Link></li>
                  <li><button onClick={logout} className="py-2 hover:bg-base-200 w-full text-left">Logout</button></li>
                </>
              )}
              {!user && !loading && (
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
};

// Footer component
const Footer = () => {
  return (
    <footer className="bg-base-200 border-t border-base-300 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="flex items-center gap-1 font-bold text-xl">
              <span className="text-primary">Ad</span>
              <span className="text-base-content">Generator</span>
            </Link>
            <p className="text-base-content/60 text-sm mt-2">© 2023 AdGenerator - All rights reserved</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2">
              <Link href="/about" className="text-base-content/70 hover:text-base-content text-sm">About</Link>
              <Link href="/contact" className="text-base-content/70 hover:text-base-content text-sm">Contact</Link>
              <Link href="/terms" className="text-base-content/70 hover:text-base-content text-sm">Terms</Link>
              <Link href="/privacy" className="text-base-content/70 hover:text-base-content text-sm">Privacy</Link>
            </div>

            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-base-content/50 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                </svg>
              </a>
              <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" className="text-base-content/50 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
                </svg>
              </a>
              <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="text-base-content/50 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html data-theme="corporate" lang="en">
      <body className={inter.className}>
        <AuthContextProvider>
          {!isLoginPage && <Navbar />}
          <div className="min-h-screen">
            {children}
          </div>
          {!isLoginPage && <Footer />}
          <Toaster position="bottom-right" />
        </AuthContextProvider>
      </body>
    </html>
  );
}
