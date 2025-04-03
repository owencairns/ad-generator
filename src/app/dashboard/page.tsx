'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');

    // Redirect if not logged in
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Mock data for the dashboard
    const recentAds = [
        { id: 1, name: 'Summer Sale Campaign', date: '2 days ago', status: 'completed', platform: 'Facebook' },
        { id: 2, name: 'Product Launch', date: '1 week ago', status: 'completed', platform: 'Instagram' },
        { id: 3, name: 'Holiday Promotion', date: '2 weeks ago', status: 'completed', platform: 'Google' },
    ];

    const savedTemplates = [
        { id: 1, name: 'E-commerce Product', usageCount: 12 },
        { id: 2, name: 'Event Promotion', usageCount: 8 },
        { id: 3, name: 'Service Offering', usageCount: 5 },
    ];

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="text-base-content/70">Loading your dashboard...</p>
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
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-base-content">Dashboard</h1>
                        <p className="text-base-content/70 mt-1">Welcome back, {user.displayName || 'User'}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/generate" className="btn btn-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1">
                                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                            </svg>
                            New Ad
                        </Link>
                        <Link href="/brainstorm" className="btn btn-outline">
                            Brainstorm Ideas
                        </Link>
                    </div>
                </div>

                {/* Dashboard Tabs */}
                <div className="tabs tabs-boxed bg-base-200 p-1 w-fit">
                    <button
                        className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab ${activeTab === 'ads' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('ads')}
                    >
                        My Ads
                    </button>
                    <button
                        className={`tab ${activeTab === 'templates' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('templates')}
                    >
                        Templates
                    </button>
                </div>

                {/* Overview Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Stats Cards */}
                        <div className="col-span-1 lg:col-span-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="stat bg-base-100 shadow rounded-box">
                                    <div className="stat-figure text-primary">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18V8.25m-18 0V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v2.25m-18 0h18M5.25 6h.008v.008H5.25V6zM7.5 6h.008v.008H7.5V6zm2.25 0h.008v.008H9.75V6z" />
                                        </svg>
                                    </div>
                                    <div className="stat-title">Total Ads</div>
                                    <div className="stat-value">31</div>
                                    <div className="stat-desc">↗︎ 40% more than last month</div>
                                </div>

                                <div className="stat bg-base-100 shadow rounded-box">
                                    <div className="stat-figure text-secondary">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                        </svg>
                                    </div>
                                    <div className="stat-title">Ad Generations</div>
                                    <div className="stat-value">8/10</div>
                                    <div className="stat-desc">This month</div>
                                </div>

                                <div className="stat bg-base-100 shadow rounded-box">
                                    <div className="stat-figure text-accent">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                                        </svg>
                                    </div>
                                    <div className="stat-title">Brainstorms</div>
                                    <div className="stat-value">5/5</div>
                                    <div className="stat-desc">☆ 100% utilization</div>
                                </div>
                            </div>

                            {/* Activity Chart Placeholder */}
                            <div className="mt-6 bg-base-100 p-6 rounded-box shadow">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">Activity Overview</h2>
                                    <div className="dropdown dropdown-end">
                                        <div tabIndex={0} role="button" className="btn btn-sm btn-ghost">
                                            Last 30 Days
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                                            <li><a>Last 7 Days</a></li>
                                            <li><a>Last 30 Days</a></li>
                                            <li><a>Last 90 Days</a></li>
                                            <li><a>Custom Range</a></li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="h-64 bg-base-200 rounded-md flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-base-content/70 mb-2">Activity visualization will appear here</p>
                                        <button className="btn btn-sm btn-outline">View Detailed Analytics</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="col-span-1">
                            <div className="bg-base-100 p-6 rounded-box shadow h-full">
                                <h2 className="text-xl font-bold mb-4">Recent Activity</h2>

                                <div className="flex flex-col gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-primary/10 p-2 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold">New Ad Created</p>
                                            <p className="text-base-content/70 text-sm">Summer Sale Campaign</p>
                                            <p className="text-xs text-base-content/50 mt-1">2 days ago</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="bg-success/10 p-2 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-success">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold">Ad Generation Completed</p>
                                            <p className="text-base-content/70 text-sm">Product Launch</p>
                                            <p className="text-xs text-base-content/50 mt-1">1 week ago</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="bg-secondary/10 p-2 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-secondary">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold">Brainstorm Session</p>
                                            <p className="text-base-content/70 text-sm">Holiday Promotion Ideas</p>
                                            <p className="text-xs text-base-content/50 mt-1">2 weeks ago</p>
                                        </div>
                                    </div>

                                    <div className="divider my-1"></div>

                                    <h3 className="font-semibold">Upcoming Tasks</h3>

                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" />
                                        <span className="text-sm">Review Summer Sale Campaign</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" />
                                        <span className="text-sm">Create new product announcements</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" />
                                        <span className="text-sm">Plan Q4 marketing strategy</span>
                                    </div>

                                    <div className="mt-4">
                                        <button className="btn btn-sm btn-outline btn-block">View All Activity</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* My Ads Tab Content */}
                {activeTab === 'ads' && (
                    <div className="bg-base-100 p-6 rounded-box shadow">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">My Ads</h2>
                            <div className="flex gap-2">
                                <div className="form-control">
                                    <div className="input-group">
                                        <input type="text" placeholder="Search ads..." className="input input-bordered input-sm" />
                                        <button className="btn btn-square btn-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <select className="select select-bordered select-sm">
                                    <option value="all">All Platforms</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="google">Google</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Platform</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentAds.map(ad => (
                                        <tr key={ad.id}>
                                            <td>{ad.name}</td>
                                            <td>{ad.platform}</td>
                                            <td>{ad.date}</td>
                                            <td>
                                                <span className="badge badge-success badge-sm">{ad.status}</span>
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button className="btn btn-xs btn-ghost">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                    </button>
                                                    <button className="btn btn-xs btn-ghost">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                        </svg>
                                                    </button>
                                                    <button className="btn btn-xs btn-ghost text-error">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex justify-between items-center">
                            <div className="text-sm text-base-content/70">
                                Showing 3 of 31 ads
                            </div>
                            <div className="join">
                                <button className="join-item btn btn-sm">«</button>
                                <button className="join-item btn btn-sm btn-active">1</button>
                                <button className="join-item btn btn-sm">2</button>
                                <button className="join-item btn btn-sm">3</button>
                                <button className="join-item btn btn-sm">»</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Templates Tab Content */}
                {activeTab === 'templates' && (
                    <div className="grid grid-cols-1 gap-6">
                        <div className="bg-base-100 p-6 rounded-box shadow">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Saved Templates</h2>
                                <button className="btn btn-primary btn-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1">
                                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                                    </svg>
                                    New Template
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Template Name</th>
                                            <th>Usage Count</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {savedTemplates.map(template => (
                                            <tr key={template.id}>
                                                <td className="font-medium">{template.name}</td>
                                                <td>{template.usageCount} times</td>
                                                <td>
                                                    <div className="flex gap-2">
                                                        <button className="btn btn-xs btn-outline">Use Template</button>
                                                        <button className="btn btn-xs btn-ghost">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                            </svg>
                                                        </button>
                                                        <button className="btn btn-xs btn-ghost text-error">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-base-100 p-6 rounded-box shadow">
                            <h2 className="text-xl font-bold mb-6">Recommended Templates</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="card bg-base-200">
                                    <div className="card-body">
                                        <h2 className="card-title">Seasonal Sale</h2>
                                        <p className="text-base-content/70">Perfect for holiday promotions and seasonal offers</p>
                                        <div className="card-actions justify-end mt-4">
                                            <button className="btn btn-sm btn-primary">Use Template</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="card bg-base-200">
                                    <div className="card-body">
                                        <h2 className="card-title">Product Showcase</h2>
                                        <p className="text-base-content/70">Highlight your product features and benefits</p>
                                        <div className="card-actions justify-end mt-4">
                                            <button className="btn btn-sm btn-primary">Use Template</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="card bg-base-200">
                                    <div className="card-body">
                                        <h2 className="card-title">Limited Time Offer</h2>
                                        <p className="text-base-content/70">Create urgency with time-limited promotions</p>
                                        <div className="card-actions justify-end mt-4">
                                            <button className="btn btn-sm btn-primary">Use Template</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 