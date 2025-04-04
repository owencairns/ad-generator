'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { GenerationDocument, GenerationStatus } from '@/types/generation';
import { Timestamp } from 'firebase/firestore';

// Define interface for generation data in the Gallery
interface GalleryGeneration {
    id: string;
    description: string;
    imageUrl: string | null;
    status: GenerationStatus;
    createdAt: string;
}

export default function GalleryPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [generations, setGenerations] = useState<GalleryGeneration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        const fetchGenerations = async () => {
            if (!user) return;

            try {
                setLoading(true);
                setError(null);

                // Reference to user's generations collection
                const generationsRef = collection(db, 'generations', user.uid, 'items');
                const q = query(generationsRef, orderBy('createdAt', 'desc'), limit(10));
                const querySnapshot = await getDocs(q);

                const generationsData: GalleryGeneration[] = querySnapshot.docs.map(doc => {
                    const data = doc.data() as GenerationDocument;
                    return {
                        id: doc.id,
                        description: data.description,
                        imageUrl: data.generatedImageUrl || null,
                        status: data.status,
                        createdAt: data.createdAt instanceof Timestamp
                            ? data.createdAt.toDate().toISOString()
                            : new Date().toISOString()
                    };
                });

                setGenerations(generationsData);
            } catch (err) {
                console.error('Error fetching generations:', err);
                setError('Failed to load your generations. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchGenerations();
        }
    }, [user, authLoading, router]);

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

    if (authLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="text-base-content/70">Loading your gallery...</p>
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
                {/* Gallery Header */}
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

                {/* Error message */}
                {error && (
                    <div className="alert alert-error shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                            <span>{error}</span>
                            <div className="mt-2">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="btn btn-sm btn-outline"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading state */}
                {loading && (
                    <div className="flex flex-col items-center py-12">
                        <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
                        <p className="text-base-content/70">Loading your generations...</p>
                    </div>
                )}

                {/* Recent Generations Grid */}
                {!loading && generations.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {generations.map((generation) => (
                            <Link
                                href={`/generate/${generation.id}`}
                                key={generation.id}
                                className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <figure className="relative aspect-square bg-base-200">
                                    {generation.imageUrl ? (
                                        <Image
                                            src={generation.imageUrl}
                                            alt={`Ad ${generation.id}`}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full">
                                            {generation.status === 'processing' ? (
                                                <span className="loading loading-spinner loading-lg text-primary"></span>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                        </div>
                                    )}
                                </figure>
                                <div className="card-body p-4">
                                    <div className="flex justify-between items-start">
                                        <h2 className="card-title text-lg">Ad {generation.id.substring(0, 6)}</h2>
                                        <div className={`badge ${generation.status === 'completed' ? 'badge-success' :
                                            generation.status === 'processing' ? 'badge-warning' :
                                                'badge-error'
                                            }`}>
                                            {generation.status}
                                        </div>
                                    </div>
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
                ) : !loading && !error ? (
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
                ) : null}
            </div>
        </div>
    );
} 