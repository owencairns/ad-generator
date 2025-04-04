'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { GenerationDocument, GenerationStatus } from '@/types/generation';

interface GenerationDetail {
    id: string;
    description: string;
    productImages: string[];
    inspirationImages: string[];
    generatedImage: string | null;
    status: GenerationStatus;
    createdAt: string;
    error?: string;
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
                    setError(null);

                    // Get document from Firestore using the correct path
                    const generationRef = doc(db, 'generations', user.uid, 'items', id);
                    const docSnap = await getDoc(generationRef);

                    if (!docSnap.exists()) {
                        throw new Error('Generation not found');
                    }

                    const data = docSnap.data() as GenerationDocument;

                    // Map Firestore data to our component's expected format
                    const generationData: GenerationDetail = {
                        id: docSnap.id,
                        description: data.description,
                        productImages: data.productImageUrls || [],
                        inspirationImages: data.inspirationImageUrls || [],
                        generatedImage: data.generatedImageUrl || null,
                        status: data.status,
                        createdAt: data.createdAt instanceof Timestamp
                            ? data.createdAt.toDate().toISOString()
                            : new Date().toISOString(),
                        error: data.error
                    };

                    setGenerationDetail(generationData);
                } catch (err) {
                    console.error("Error fetching generation detail:", err);
                    setError(err instanceof Error ? err.message : "Failed to load generation details. Please try again.");
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
                <div className="mt-4">
                    <Link href="/gallery" className="btn btn-primary">Back to Galleryå</Link>
                </div>
            </div>
        );
    }

    if (!generationDetail) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col gap-8 max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-base-content">Generation Details</h1>
                        <p className="text-base-content/70 mt-1">View and manage your generated advertisement</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/gallery" className="btn btn-outline btn-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            Gallery
                        </Link>
                        <Link href="/generate" className="btn btn-primary btn-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            New Ad
                        </Link>
                    </div>
                </div>

                {/* Generation Result */}
                <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-base-200">
                        {/* Left Column - Generated Image */}
                        <div className="p-6 flex flex-col items-center justify-start">
                            <div className="relative bg-base-200 rounded-xl w-full max-w-xl aspect-square">
                                {generationDetail.generatedImage ? (
                                    <Image
                                        src={generationDetail.generatedImage}
                                        alt="Generated Ad"
                                        fill
                                        className="object-contain rounded-xl"
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        priority
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full">
                                        {generationDetail.status === 'processing' ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <span className="loading loading-spinner loading-lg text-primary"></span>
                                                <p className="text-base-content/70 text-center">Creating your perfect ad...</p>
                                            </div>
                                        ) : generationDetail.status === 'error' ? (
                                            <div className="flex flex-col items-center gap-3 p-4">
                                                <div className="text-error">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                </div>
                                                <p className="text-error text-center font-medium">Generation failed</p>
                                                <p className="text-base-content/70 text-center text-sm">{generationDetail.error || "An unknown error occurred"}</p>
                                            </div>
                                        ) : (
                                            <div className="text-base-content/30">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {generationDetail.generatedImage && (
                                <div className="flex gap-3 mt-6">
                                    <button className="btn btn-primary btn-sm gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download
                                    </button>
                                    <button className="btn btn-outline btn-sm gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit
                                    </button>
                                    <button className="btn btn-outline btn-sm gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                        Share
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Generation Details */}
                        <div className="p-6">
                            <div className="space-y-6">
                                {/* Status and Date */}
                                <div className="flex flex-wrap gap-4 items-center">
                                    <span className={`badge ${
                                        generationDetail.status === 'completed' 
                                            ? 'badge-success' 
                                            : generationDetail.status === 'processing' 
                                                ? 'badge-warning' 
                                                : 'badge-error'
                                    } badge-lg`}>
                                        {generationDetail.status.charAt(0).toUpperCase() + generationDetail.status.slice(1)}
                                    </span>
                                    <span className="text-base-content/70">
                                        Generated on {new Date(generationDetail.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="text-sm font-medium text-base-content/70 mb-2">Description</h3>
                                    <div className="bg-base-200 rounded-lg p-4">
                                        <p className="text-base-content whitespace-pre-wrap">{generationDetail.description}</p>
                                    </div>
                                </div>

                                {/* Product Images */}
                                <div>
                                    <h3 className="text-sm font-medium text-base-content/70 mb-2">Product Images</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {generationDetail.productImages.length > 0 ? (
                                            generationDetail.productImages.map((img, index) => (
                                                <div key={`product-${index}`} className="relative bg-white rounded-lg shadow-sm aspect-square overflow-hidden">
                                                    <Image
                                                        src={img}
                                                        alt={`Product Image ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-2 bg-base-200 rounded-lg p-4 text-center text-base-content/50">
                                                No product images available
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Inspiration Images */}
                                {generationDetail.inspirationImages && generationDetail.inspirationImages.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-base-content/70 mb-2">Inspiration</h3>
                                        <div className="grid grid-cols-2 gap-3">
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
            </div>
        </div>
    );
} 