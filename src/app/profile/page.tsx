'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';

// Add this CSS at the top of the file
const ThemeIcon = ({ theme }: { theme: string }) => (
    <div className="relative w-5 h-5">
        {/* Sun icon */}
        <div 
            className={`
                absolute inset-0 transform transition-all duration-500 ease-in-out
                ${theme === 'dark' 
                    ? 'rotate-[360deg] scale-0 translate-y-10 opacity-0' 
                    : 'rotate-0 scale-100 translate-y-0 opacity-100'
                }
            `}
        >
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor"
                className="transform-gpu"
            >
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="transform origin-center transition-all duration-500"
                    d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" 
                />
            </svg>
        </div>
        {/* Moon icon */}
        <div 
            className={`
                absolute inset-0 transform transition-all duration-500 ease-in-out
                ${theme === 'dark' 
                    ? 'rotate-0 scale-100 -translate-y-0 opacity-100' 
                    : '-rotate-[360deg] scale-0 -translate-y-10 opacity-0'
                }
            `}
        >
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor"
                className="transform-gpu"
            >
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="transform origin-center transition-all duration-500" 
                    d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" 
                />
            </svg>
        </div>
    </div>
);

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('profile');
    const [theme, setTheme] = useState('light');
    const [isSaving, setIsSaving] = useState(false);

    // Load theme from Firebase
    useEffect(() => {
        const loadTheme = async () => {
            if (!user?.uid) return;
            
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const savedTheme = userData.theme || 'light';
                    setTheme(savedTheme);
                    document.documentElement.setAttribute('data-theme', savedTheme);
                }
            } catch (error) {
                console.error('Error loading theme:', error);
            }
        };

        loadTheme();
    }, [user?.uid]);

    // Theme toggle handler with Firebase sync
    const toggleTheme = async () => {
        if (!user?.uid || isSaving) return;

        const newTheme = theme === 'light' ? 'dark' : 'light';
        setIsSaving(true);

        try {
            await updateDoc(doc(db, 'users', user.uid), {
                theme: newTheme
            });
            
            setTheme(newTheme);
            document.documentElement.setAttribute('data-theme', newTheme);
        } catch (error) {
            console.error('Error saving theme:', error);
            // Revert theme if save fails
            document.documentElement.setAttribute('data-theme', theme);
        } finally {
            setIsSaving(false);
        }
    };

    // Redirect if not logged in
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="text-base-content/70">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect via useEffect
    }

    return (
        <div className="container mx-auto px-4 py-8 transition-colors duration-200">
            <div className="flex flex-col gap-6">
                {/* Profile Header */}
                <div className="bg-base-100 rounded-xl shadow-lg p-8 transition-all duration-200 hover:shadow-xl">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group">
                            {user.photoURL ? (
                                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-primary/20 transition-all duration-200 group-hover:border-primary/40">
                                    <Image
                                        src={user.photoURL}
                                        alt={user.displayName || 'Profile'}
                                        width={144}
                                        height={144}
                                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                                    />
                                </div>
                            ) : (
                                <div className="w-36 h-36 rounded-full bg-primary/10 flex items-center justify-center text-5xl font-bold text-primary border-4 border-primary/20 transition-all duration-200 group-hover:border-primary/40">
                                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <button className="btn btn-circle btn-sm btn-primary absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-3">
                            <h1 className="text-3xl font-bold text-base-content">{user.displayName || 'User'}</h1>
                            <p className="text-base-content/70 text-lg">{user.email}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                                <span className="badge badge-primary badge-lg">Free Plan</span>
                                <span className="badge badge-ghost badge-lg">Joined 2023</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button 
                                className="btn btn-ghost rounded-full px-8 normal-case text-base font-medium hover:scale-105 transition-transform outline-1 outline-base-300"
                                onClick={toggleTheme}
                                disabled={isSaving}
                            >
                                <ThemeIcon theme={theme} />
                                <span className="ml-2 opacity-90">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                            </button>
                            <button className="btn btn-error btn-outline rounded-full px-8 normal-case text-base font-medium hover:scale-105 transition-transform" onClick={logout}>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs and Content */}
                <div className="flex flex-col gap-6">
                    <div className="tabs tabs-boxed bg-base-200/50 p-2 w-fit rounded-full">
                        <button
                            className={`tab tab-lg transition-all duration-200 ${activeTab === 'profile' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            Profile Information
                        </button>
                        <button
                            className={`tab tab-lg transition-all duration-200 ${activeTab === 'billing' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('billing')}
                        >
                            Billing
                        </button>
                    </div>

                    {/* Profile Tab Content */}
                    {activeTab === 'profile' && (
                        <div className="bg-base-100 rounded-xl shadow-lg p-8 transition-all duration-200 hover:shadow-xl">
                            <h2 className="text-2xl font-bold mb-8">Profile Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text text-base">Name</span>
                                    </label>
                                    <input type="text" className="input input-bordered w-full transition-all duration-200 focus:input-primary"
                                        defaultValue={user.displayName || ''}
                                        placeholder="Your name"
                                    />
                                </div>

                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text text-base">Email</span>
                                    </label>
                                    <input type="email" className="input input-bordered w-full opacity-70"
                                        value={user.email || ''}
                                        readOnly
                                        disabled
                                    />
                                </div>

                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text text-base">Phone Number</span>
                                    </label>
                                    <input type="tel" className="input input-bordered w-full transition-all duration-200 focus:input-primary"
                                        defaultValue={user.phoneNumber || ''}
                                        placeholder="Your phone number"
                                    />
                                </div>

                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text text-base">Company</span>
                                    </label>
                                    <input type="text" className="input input-bordered w-full transition-all duration-200 focus:input-primary"
                                        placeholder="Your company name"
                                    />
                                </div>
                            </div>

                            <div className="divider my-8"></div>

                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text text-base">Bio</span>
                                </label>
                                <textarea className="textarea textarea-bordered w-full h-32 transition-all duration-200 focus:textarea-primary"
                                    placeholder="Tell us about yourself or your business"
                                ></textarea>
                            </div>
                        </div>
                    )}

                    {/* Billing Tab Content */}
                    {activeTab === 'billing' && (
                        <div className="bg-base-100 rounded-xl shadow-lg p-8 transition-all duration-200 hover:shadow-xl">
                            <h2 className="text-2xl font-bold mb-8">Billing Information</h2>

                            <div className="space-y-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <p className="text-lg font-bold">Current Plan</p>
                                        <p className="text-base-content/70">Free Plan</p>
                                    </div>
                                    <button className="btn btn-primary btn-lg">Upgrade Plan</button>
                                </div>

                                <div className="stats stats-vertical lg:stats-horizontal shadow w-full bg-base-200/50">
                                    <div className="stat">
                                        <div className="stat-title">Ad Generations</div>
                                        <div className="stat-value text-primary">8/10</div>
                                        <div className="stat-desc">This month</div>
                                    </div>

                                    <div className="stat">
                                        <div className="stat-title">Brainstorm Sessions</div>
                                        <div className="stat-value text-primary">5/5</div>
                                        <div className="stat-desc">This month</div>
                                    </div>

                                    <div className="stat">
                                        <div className="stat-title">Plan Renewal</div>
                                        <div className="stat-value text-success">FREE</div>
                                        <div className="stat-desc">Forever</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h3 className="text-lg font-bold mb-4">Available Plans</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="card bg-base-200">
                                        <div className="card-body">
                                            <h2 className="card-title">Free</h2>
                                            <p className="text-3xl font-bold">$0<span className="text-base font-normal text-base-content/70">/mo</span></p>
                                            <ul className="my-4 space-y-2">
                                                <li className="flex items-center">
                                                    <svg className="w-4 h-4 mr-2 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    10 Ad Generations
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="w-4 h-4 mr-2 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    5 Brainstorm Sessions
                                                </li>
                                                <li className="flex items-center text-base-content/50">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Standard Templates
                                                </li>
                                            </ul>
                                            <div className="card-actions justify-end">
                                                <button className="btn btn-outline rounded-full px-8 normal-case text-base font-medium hover:scale-105 transition-transform btn-block" disabled>Current Plan</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card bg-base-200 border-2 border-primary">
                                        <div className="card-body">
                                            <div className="badge badge-primary mb-2">Popular</div>
                                            <h2 className="card-title">Pro</h2>
                                            <p className="text-3xl font-bold">$29<span className="text-base font-normal text-base-content/70">/mo</span></p>
                                            <ul className="my-4 space-y-2">
                                                <li className="flex items-center">
                                                    <svg className="w-4 h-4 mr-2 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    100 Ad Generations
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="w-4 h-4 mr-2 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Unlimited Brainstorm
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="w-4 h-4 mr-2 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Premium Templates
                                                </li>
                                            </ul>
                                            <div className="card-actions justify-end">
                                                <button className="btn btn-primary rounded-full px-8 normal-case text-base font-medium hover:scale-105 transition-transform btn-block">Upgrade</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card bg-base-200">
                                        <div className="card-body">
                                            <h2 className="card-title">Business</h2>
                                            <p className="text-3xl font-bold">$99<span className="text-base font-normal text-base-content/70">/mo</span></p>
                                            <ul className="my-4 space-y-2">
                                                <li className="flex items-center">
                                                    <svg className="w-4 h-4 mr-2 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Unlimited Ad Generations
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="w-4 h-4 mr-2 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Unlimited Brainstorm
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="w-4 h-4 mr-2 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    White Label Exports
                                                </li>
                                            </ul>
                                            <div className="card-actions justify-end">
                                                <button className="btn btn-outline rounded-full px-8 normal-case text-base font-medium hover:scale-105 transition-transform btn-block">Upgrade</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 