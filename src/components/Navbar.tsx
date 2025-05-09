'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from './ThemeToggle';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme } = useTheme();

    return (
        <div className="navbar bg-base-100 border-b border-base-200 shadow-sm py-3">
            <div className="flex-1">
                <Link href="/" className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-base-200 transition-colors duration-200">
                    <Image 
                        src={theme === 'dark' ? '/images/logos/logo-dark.png' : '/images/logos/logo-light.png'}
                        alt="Eadsy Logo"
                        width={100}
                        height={30}
                        className="h-8 w-auto"
                    />
                </Link>
            </div>
            <div className="flex-none gap-3">
                <ThemeToggle />
                {user ? (
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar ring-2 ring-primary/15 hover:ring-primary/30 transition-all duration-300">
                            <div className="w-10 rounded-full">
                                <Image 
                                    alt="User avatar" 
                                    src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                                    className="w-full h-full object-cover"
                                    width={40}
                                    height={40}
                                />
                            </div>
                        </div>
                        <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-md menu menu-sm dropdown-content bg-base-100 rounded-xl w-52 border border-base-200">
                            <li>
                                <Link href="/profile" className="justify-between text-base-content hover:bg-base-200 hover:text-primary py-2 rounded-md transition-all duration-200">
                                    Profile
                                    <span className="badge badge-primary badge-sm text-primary-content">New</span>
                                </Link>
                            </li>
                            <li><Link href="/settings" className="text-base-content hover:bg-base-200 hover:text-secondary py-2 rounded-md transition-all duration-200">Settings</Link></li>
                            <li><button onClick={() => logout()} className="text-base-content hover:bg-error/10 hover:text-error py-2 rounded-md transition-all duration-200">Logout</button></li>
                        </ul>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        <Link href="/signup" className="btn btn-outline border-secondary/70 text-secondary hover:bg-secondary/5 hover:border-secondary hover:text-secondary rounded-lg px-5 normal-case text-base font-medium transition-all duration-300">Sign Up</Link>
                        <Link href="/login" className="btn bg-primary text-primary-content hover:bg-primary/90 rounded-lg px-5 normal-case text-base font-medium transition-all duration-300">Login</Link>
                    </div>
                )}
            </div>
        </div>
    );
} 