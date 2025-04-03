'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Fallback images from Unsplash
const FALLBACK_PRODUCT_IMAGES = [
    'https://images.unsplash.com/photo-1560343090-f0409e92791a?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop'
];

const FALLBACK_INSPIRATION_IMAGES = [
    'https://images.unsplash.com/photo-1533262790211-4d970f0bdd20?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1592842232655-e5d345cbc2d0?q=80&w=600&auto=format&fit=crop'
];

interface GenerationDetail {
    id: string;
    description: string;
    productImages: string[];
    inspirationImages: string[];
    generatedImage: string;
    status: 'completed' | 'processing' | 'error';
    createdAt: string;
    platform?: string;
    style?: string;
    includeLogo?: boolean;
}

export default function GenerationDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
    // Unwrap params using React.use() for future compatibility
    const unwrappedParams = params instanceof Promise ? React.use(params) : params;
    const { id } = unwrappedParams;

    const router = useRouter();
    const { user, loading } = useAuth();
    const [generationDetail, setGenerationDetail] = useState<GenerationDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            const fetchGenerationDetail = async () => {
                try {
                    setIsLoading(true);

                    // In a real app, you would fetch this from Firestore
                    // For now, we're using a mock for demonstration

                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // For now, create mock data
                    // In production, you'd fetch this from your database
                    const mockGenerationDetail: GenerationDetail = {
                        id,
                        description: "A modern, minimalist ad for an eco-friendly water bottle that emphasizes its sleek design and sustainable materials. The ad should have a clean background with nature elements.",
                        productImages: FALLBACK_PRODUCT_IMAGES,
                        inspirationImages: FALLBACK_INSPIRATION_IMAGES,
                        generatedImage: "https://images.unsplash.com/photo-1610824352934-c10d87b700cc?q=80&w=1200&auto=format&fit=crop",
                        status: 'completed',
                        createdAt: new Date().toISOString(),
                        platform: 'Instagram',
                        style: 'Modern & Minimalist',
                        includeLogo: true
                    };

                    setGenerationDetail(mockGenerationDetail);
                } catch (err) {
                    console.error("Error fetching generation detail:", err);
                    setError("Failed to load generation details. Please try again.");
                } finally {
                    setIsLoading(false);
                }
            };

            fetchGenerationDetail();
        }
    }, [user, loading, id, router]);

    if (loading || isLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="text-base-content/70">Loading generation details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    if (!generationDetail) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col gap-8">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-base-content">Generation Details</h1>
                        <p className="text-base-content/70 mt-1">View the details of your generated ad</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/generate" className="btn btn-outline">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Back to Generate
                        </Link>
                        <Link href="/dashboard" className="btn btn-ghost">
                            Dashboard
                        </Link>
                    </div>
                </div>

                {/* Generation Result */}
                <div className="bg-base-100 rounded-box shadow">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Left Column - Generated Image */}
                        <div className="p-6 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-base-300">
                            <div className="relative bg-base-200 rounded-lg shadow-md w-full max-w-lg aspect-square">
                                <Image
                                    src={generationDetail.generatedImage}
                                    alt="Generated Ad"
                                    fill
                                    className="object-cover rounded-lg"
                                />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button className="btn btn-circle btn-sm btn-primary">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    </button>
                                    <button className="btn btn-circle btn-sm btn-primary">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button className="btn btn-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download Ad
                                </button>
                                <button className="btn btn-outline">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Ad
                                </button>
                            </div>
                        </div>

                        {/* Right Column - Generation Details */}
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">Ad Details</h2>

                            <div className="space-y-6">
                                {/* Description */}
                                <div>
                                    <h3 className="font-semibold text-base-content/80 mb-2">Description</h3>
                                    <p className="text-base-content bg-base-200 p-4 rounded-lg">{generationDetail.description}</p>
                                </div>

                                {/* Generation Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-semibold text-base-content/80 mb-2">Generated On</h3>
                                        <p className="text-base-content/80">{new Date(generationDetail.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-base-content/80 mb-2">Status</h3>
                                        <span className={`badge ${generationDetail.status === 'completed' ? 'badge-success' : generationDetail.status === 'processing' ? 'badge-warning' : 'badge-error'}`}>
                                            {generationDetail.status.charAt(0).toUpperCase() + generationDetail.status.slice(1)}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-base-content/80 mb-2">Platform</h3>
                                        <p className="text-base-content/80">{generationDetail.platform || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-base-content/80 mb-2">Style</h3>
                                        <p className="text-base-content/80">{generationDetail.style || 'Not specified'}</p>
                                    </div>
                                </div>

                                {/* Product Images */}
                                <div>
                                    <h3 className="font-semibold text-base-content/80 mb-2">Product Images</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {generationDetail.productImages.map((img, index) => (
                                            <div key={`product-${index}`} className="relative bg-white rounded-lg shadow-sm aspect-square overflow-hidden">
                                                <Image
                                                    src={img}
                                                    alt={`Product Image ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Inspiration Images */}
                                {generationDetail.inspirationImages && generationDetail.inspirationImages.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-base-content/80 mb-2">Inspiration Images</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {generationDetail.inspirationImages.map((img, index) => (
                                                <div key={`inspiration-${index}`} className="relative bg-white rounded-lg shadow-sm aspect-square overflow-hidden">
                                                    <Image
                                                        src={img}
                                                        alt={`Inspiration Image ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
                    <div className="flex flex-wrap gap-2">
                        <button className="btn btn-outline btn-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            Share
                        </button>
                        <button className="btn btn-outline btn-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print
                        </button>
                        <button className="btn btn-outline btn-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            Save
                        </button>
                    </div>

                    <div>
                        <Link href="/generate" className="btn btn-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Create New Ad
                        </Link>
                    </div>
                </div>

                {/* Similar Generations */}
                <div className="bg-base-100 rounded-box shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Similar Generations</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="card bg-base-200">
                                <figure className="relative aspect-square">
                                    <Image
                                        src={`https://images.unsplash.com/photo-1560343${item}90-f0409e92791${item}?q=80&w=400&auto=format&fit=crop`}
                                        alt={`Similar generation ${item}`}
                                        fill
                                        className="object-cover"
                                    />
                                </figure>
                                <div className="card-body p-4">
                                    <h3 className="card-title text-sm">Product Ad #{item}</h3>
                                    <p className="text-xs text-base-content/70">Generated 3 days ago</p>
                                    <div className="card-actions justify-end mt-2">
                                        <Link href={`/generate/sample-${item}`} className="btn btn-sm btn-outline">View</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 