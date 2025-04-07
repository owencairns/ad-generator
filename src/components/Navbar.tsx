'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from './ThemeToggle';
import Image from 'next/image';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <div className="navbar bg-base-100 border-b border-base-200">
            <div className="flex-1">
                <Link href="/" className="btn btn-ghost text-xl">Ad Generator</Link>
            </div>
            <div className="flex-none gap-2">
                <ThemeToggle />
                {user ? (
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
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
                        <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                            <li>
                                <Link href="/profile" className="justify-between">
                                    Profile
                                    <span className="badge">New</span>
                                </Link>
                            </li>
                            <li><Link href="/settings">Settings</Link></li>
                            <li><button onClick={() => logout()}>Logout</button></li>
                        </ul>
                    </div>
                ) : (
                    <Link href="/login" className="btn btn-primary rounded-full px-8 normal-case text-base font-medium hover:scale-105 transition-transform">Login</Link>
                )}
            </div>
        </div>
    );
} 