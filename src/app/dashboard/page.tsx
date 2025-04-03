'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Define types for the generation data
interface Generation {
    id: string;
    description: string;
    imageUrl: string;
    createdAt: string;
}

// Mock data for recent generations (to be replaced with Firebase data)
const MOCK_GENERATIONS: Generation[] = [
    {
        id: 'sample-1',
        description: 'A modern, minimalist ad for an eco-friendly water bottle that emphasizes its sleek design and sustainable materials.',
        imageUrl: 'https://images.unsplash.com/photo-1610824352934-c10d87b700cc?q=80&w=1200&auto=format&fit=crop',
        createdAt: '2023-04-01T12:00:00Z'
    },
    {
        id: 'sample-2',
        description: 'Vibrant and colorful advertisement for a new line of athletic shoes highlighting the comfort and performance features.',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
        createdAt: '2023-03-28T15:30:00Z'
    },
    {
        id: 'sample-3',
        description: 'Elegant and luxurious ad for a premium watch showcasing craftsmanship and attention to detail.',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop',
        createdAt: '2023-03-25T09:45:00Z'
    },
    {
        id: 'sample-4',
        description: 'Playful and fun advertisement for a new board game that appeals to families and casual gamers.',
        imageUrl: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?q=80&w=600&auto=format&fit=crop',
        createdAt: '2023-03-22T14:20:00Z'
    },
    {
        id: 'sample-5',
        description: 'Clean, tech-focused ad for wireless headphones highlighting noise cancellation and sound quality.',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
        createdAt: '2023-03-18T11:10:00Z'
    },
    {
        id: 'sample-6',
        description: 'Rustic and warm advertisement for a specialty coffee brand focusing on ethically sourced beans and rich flavor.',
        imageUrl: 'https://images.unsplash.com/photo-1572119865084-43c285814d63?q=80&w=600&auto=format&fit=crop',
        createdAt: '2023-03-15T08:30:00Z'
    }
];

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [generations] = useState<Generation[]>(MOCK_GENERATIONS);

    // Redirect if not logged in
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }

        // Here you would fetch generations from Firebase
        // Example code (commented out for now):
        /*
        if (user) {
          const fetchGenerations = async () => {
            const userGenerationsRef = collection(db, 'users', user.uid, 'generations');
            const q = query(userGenerationsRef, orderBy('createdAt', 'desc'), limit(10));
            const querySnapshot = await getDocs(q);
            
            const generationsData = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            setGenerations(generationsData);
          };
          
          fetchGenerations();
        }
        */
    }, [user, loading, router]);

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

    // Format relative time
    const formatRelativeTime = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
        return `${Math.floor(diffInDays / 30)} months ago`;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col gap-8">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-base-content">Your Ads</h1>
                        <p className="text-base-content/70 mt-1">Welcome back, {user.displayName || 'User'}</p>
                    </div>
                    <Link href="/generate" className="btn btn-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1">
                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                        Create New Ad
                    </Link>
                </div>

                {/* Recent Generations Grid */}
                {generations.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {generations.map((generation) => (
                            <Link
                                href={`/generate/${generation.id}`}
                                key={generation.id}
                                className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <figure className="relative aspect-square">
                                    <Image
                                        src={generation.imageUrl}
                                        alt={`Ad ${generation.id}`}
                                        fill
                                        className="object-cover"
                                    />
                                </figure>
                                <div className="card-body p-4">
                                    <h2 className="card-title text-lg">Ad {generation.id.split('-')[1]}</h2>
                                    <p className="text-base-content/70 text-sm line-clamp-2">
                                        {generation.description}
                                    </p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-xs text-base-content/50">
                                            {formatRelativeTime(generation.createdAt)}
                                        </span>
                                        <div className="badge badge-primary">View</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-base-200 rounded-lg p-10 text-center">
                        <div className="max-w-md mx-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <h3 className="text-xl font-bold mb-2">No ads yet</h3>
                            <p className="text-base-content/70 mb-6">You haven&apos;t created any ads yet. Get started by creating your first ad.</p>
                            <Link href="/generate" className="btn btn-primary">
                                Create Your First Ad
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 