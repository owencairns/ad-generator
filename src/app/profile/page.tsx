'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('profile');

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
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col gap-8">
                {/* Profile Header */}
                <div className="bg-base-100 rounded-box shadow p-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                            {user.photoURL ? (
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-base-300">
                                    <Image
                                        src={user.photoURL}
                                        alt={user.displayName || 'Profile'}
                                        width={128}
                                        height={128}
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary border-4 border-base-300">
                                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <button className="btn btn-circle btn-sm btn-primary absolute bottom-0 right-0">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-2xl font-bold text-base-content">{user.displayName || 'User'}</h1>
                            <p className="text-base-content/70">{user.email}</p>
                            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                                <span className="badge badge-primary">Free Plan</span>
                                <span className="badge badge-outline">Joined 2023</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button className="btn btn-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 mr-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Save Changes
                            </button>
                            <button className="btn btn-outline btn-error" onClick={logout}>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs and Content */}
                <div className="flex flex-col gap-4">
                    <div className="tabs tabs-boxed bg-base-200 p-1 w-fit">
                        <button
                            className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            Profile Information
                        </button>
                        <button
                            className={`tab ${activeTab === 'preferences' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('preferences')}
                        >
                            Preferences
                        </button>
                        <button
                            className={`tab ${activeTab === 'billing' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('billing')}
                        >
                            Billing
                        </button>
                    </div>

                    {/* Profile Tab Content */}
                    {activeTab === 'profile' && (
                        <div className="bg-base-100 rounded-box shadow p-6">
                            <h2 className="text-xl font-bold mb-6">Profile Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text">Name</span>
                                    </label>
                                    <input type="text" className="input input-bordered w-full"
                                        defaultValue={user.displayName || ''}
                                        placeholder="Your name"
                                    />
                                </div>

                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text">Email</span>
                                    </label>
                                    <input type="email" className="input input-bordered w-full"
                                        value={user.email || ''}
                                        readOnly
                                        disabled
                                    />
                                </div>

                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text">Phone Number</span>
                                    </label>
                                    <input type="tel" className="input input-bordered w-full"
                                        defaultValue={user.phoneNumber || ''}
                                        placeholder="Your phone number"
                                    />
                                </div>

                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text">Company</span>
                                    </label>
                                    <input type="text" className="input input-bordered w-full"
                                        placeholder="Your company name"
                                    />
                                </div>
                            </div>

                            <div className="divider"></div>

                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text">Bio</span>
                                </label>
                                <textarea className="textarea textarea-bordered w-full h-32"
                                    placeholder="Tell us about yourself or your business"
                                ></textarea>
                            </div>
                        </div>
                    )}

                    {/* Preferences Tab Content */}
                    {activeTab === 'preferences' && (
                        <div className="bg-base-100 rounded-box shadow p-6">
                            <h2 className="text-xl font-bold mb-6">Preferences</h2>

                            <div className="flex flex-col gap-4">
                                <div className="form-control">
                                    <label className="label cursor-pointer justify-start gap-4">
                                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                                        <span className="label-text">Email notifications for new features</span>
                                    </label>
                                </div>

                                <div className="form-control">
                                    <label className="label cursor-pointer justify-start gap-4">
                                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                                        <span className="label-text">Email notifications for completed ad generations</span>
                                    </label>
                                </div>

                                <div className="form-control">
                                    <label className="label cursor-pointer justify-start gap-4">
                                        <input type="checkbox" className="toggle toggle-primary" />
                                        <span className="label-text">Share usage data to improve services</span>
                                    </label>
                                </div>

                                <div className="divider"></div>

                                <div className="form-control w-full max-w-xs">
                                    <label className="label">
                                        <span className="label-text">Theme Preference</span>
                                    </label>
                                    <select className="select select-bordered">
                                        <option value="system">System Default</option>
                                        <option value="light">Light Mode</option>
                                        <option value="dark">Dark Mode</option>
                                    </select>
                                </div>

                                <div className="form-control w-full max-w-xs">
                                    <label className="label">
                                        <span className="label-text">Language</span>
                                    </label>
                                    <select className="select select-bordered">
                                        <option value="en">English</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                        <option value="de">German</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Billing Tab Content */}
                    {activeTab === 'billing' && (
                        <div className="bg-base-100 rounded-box shadow p-6">
                            <h2 className="text-xl font-bold mb-6">Billing Information</h2>

                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="font-bold">Current Plan</p>
                                        <p className="text-base-content/70">Free Plan</p>
                                    </div>
                                    <button className="btn btn-primary">Upgrade Plan</button>
                                </div>

                                <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
                                    <div className="stat">
                                        <div className="stat-title">Ad Generations</div>
                                        <div className="stat-value">8/10</div>
                                        <div className="stat-desc">This month</div>
                                    </div>

                                    <div className="stat">
                                        <div className="stat-title">Brainstorm Sessions</div>
                                        <div className="stat-value">5/5</div>
                                        <div className="stat-desc">This month</div>
                                    </div>

                                    <div className="stat">
                                        <div className="stat-title">Plan Renewal</div>
                                        <div className="stat-value text-success">FREE</div>
                                        <div className="stat-desc">Forever</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
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
                                                <button className="btn btn-outline btn-block" disabled>Current Plan</button>
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
                                                <button className="btn btn-primary btn-block">Upgrade</button>
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
                                                <button className="btn btn-outline btn-block">Upgrade</button>
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