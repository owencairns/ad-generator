'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { 
    GenerationDocument, 
    GenerationStatus,
    GenerateApiRequest,
    GenerateApiResponse 
} from '@/types/generation';
import { STYLE_PRESETS } from '../constants/styles';

interface GenerationDetail {
    id: string;
    description: string;
    productDescription: string;
    productImages: string[];
    inspirationImages: string[];
    generatedImage: string | null;
    status: GenerationStatus;
    createdAt: string;
    error?: string;
    style?: string;
    aspectRatio?: string;
    textInfo?: {
        mainText: string;
        secondaryText: string;
        position: string;
        styleNotes: string;
    };
}

const getStyleName = (styleDescription: string | undefined): string => {
    if (!styleDescription) return 'Unknown Style';

    // Find the preset by matching its description
    const preset = Object.values(STYLE_PRESETS).find(
        preset => preset.description === styleDescription
    );

    if (preset) {
        return preset.name;
    }

    // If no preset matches, it's a custom style
    return `Custom Style`;
};

export default function GenerationDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
    const unwrappedParams = params instanceof Promise ? React.use(params) : params;
    const { id } = unwrappedParams;

    const router = useRouter();
    const { user, loading } = useAuth();
    const [generationDetail, setGenerationDetail] = useState<GenerationDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editDescription, setEditDescription] = useState('');
    const [showDetails, setShowDetails] = useState(false);

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
                        productDescription: data.productDescription,
                        productImages: data.productImageUrls || [],
                        inspirationImages: data.inspirationImageUrls || [],
                        generatedImage: data.generatedImageUrl || null,
                        status: data.status,
                        createdAt: data.createdAt instanceof Timestamp
                            ? data.createdAt.toDate().toISOString()
                            : new Date().toISOString(),
                        error: data.error,
                        style: data.style,
                        aspectRatio: data.aspectRatio,
                        textInfo: data.textInfo
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

    const handleRegenerateImage = async (editDescription: string) => {
        if (!user || !generationDetail) return;

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description: editDescription,
                    productDescription: generationDetail.productDescription,
                    productImages: generationDetail.productImages,
                    inspirationImages: generationDetail.inspirationImages,
                    userId: user.uid,
                    generationId: generationDetail.id,
                    style: generationDetail.style,
                    aspectRatio: generationDetail.aspectRatio,
                    textInfo: generationDetail.textInfo
                } as GenerateApiRequest),
            });

            const data = await response.json() as GenerateApiResponse;

            if (!response.ok) {
                throw new Error(data.data?.error || 'Failed to regenerate image');
            }

            // Redirect to the new generation
            router.push(`/generate/${generationDetail.id}`);
        } catch (err) {
            console.error('Error regenerating image:', err);
            // You might want to show an error toast here
        }
    };

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
                    <Link href="/gallery" className="btn btn-primary">Back to Gallery</Link>
                </div>
            </div>
        );
    }

    if (!generationDetail) {
        return null;
    }

    return (
        <div className="min-h-screen bg-base-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header with Navigation */}
                <div className="flex justify-between items-center mb-8">
                    <Link href="/gallery" className="btn btn-ghost btn-sm gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Gallery
                    </Link>
                    <Link href="/generate" className="btn btn-primary btn-sm gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        New Ad
                    </Link>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
                    {/* Generated Image Section - Takes up 3 columns */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-base-200 overflow-hidden">
                            {/* Image Display */}
                            <div className="relative aspect-square">
                                {generationDetail.generatedImage ? (
                                    <Image
                                        src={generationDetail.generatedImage}
                                        alt="Generated Ad"
                                        fill
                                        className="object-contain"
                                        sizes="(max-width: 1024px) 100vw, 60vw"
                                        priority
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-base-200">
                                        {generationDetail.status === 'processing' ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <span className="loading loading-spinner loading-lg text-primary"></span>
                                                <p className="text-base-content/70">Creating your perfect ad...</p>
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

                            {/* Action Buttons */}
                            {generationDetail.generatedImage && (
                                <div className="p-6 border-t border-base-200 bg-white/50 backdrop-blur-sm">
                                    <div className="flex flex-wrap gap-3">
                                        <button className="btn btn-primary gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Download
                                        </button>
                                        <button 
                                            className="btn btn-outline gap-2"
                                            onClick={() => setIsEditModalOpen(true)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                            Edit & Regenerate
                                        </button>
                                        <button className="btn btn-outline gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                            </svg>
                                            Share
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Section - Takes up 2 columns */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-base-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className={`badge ${
                                    generationDetail.status === 'completed' 
                                        ? 'badge-success' 
                                        : generationDetail.status === 'processing' 
                                            ? 'badge-warning' 
                                            : 'badge-error'
                                } badge-lg`}>
                                    {generationDetail.status.charAt(0).toUpperCase() + generationDetail.status.slice(1)}
                                </span>
                                <span className="text-base-content/70 text-sm">
                                    {new Date(generationDetail.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="prose max-w-none">
                                <h3 className="text-lg font-semibold mb-2">Description</h3>
                                <p className="text-base-content/80">{generationDetail.description}</p>
                            </div>
                        </div>

                        {/* Product Images */}
                        <div className="bg-white rounded-3xl shadow-sm border border-base-200 overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Product Images Used</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {generationDetail.productImages.map((img, index) => (
                                        <div 
                                            key={index} 
                                            className="group relative aspect-square rounded-2xl overflow-hidden bg-base-100 hover:shadow-lg transition-all duration-300"
                                        >
                                            {/* Background blur effect */}
                                            <div 
                                                className="absolute inset-0 bg-cover bg-center blur-xl opacity-20 scale-110 transition-transform group-hover:scale-125"
                                                style={{ backgroundImage: `url(${img})` }}
                                            />
                                            
                                            {/* Main image */}
                                            <div className="relative h-full w-full p-2">
                                                <div className="relative h-full w-full rounded-xl overflow-hidden bg-white">
                                                    <Image
                                                        src={img}
                                                        alt={`Product ${index + 1}`}
                                                        fill
                                                        className="object-contain hover:scale-105 transition-transform duration-300"
                                                        sizes="(max-width: 1024px) 50vw, 25vw"
                                                    />
                                                </div>
                                            </div>

                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300">
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <button 
                                                        className="btn btn-circle btn-ghost btn-sm bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white border-0"
                                                        onClick={() => window.open(img, '_blank')}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Image number badge */}
                                            <div className="absolute top-3 left-3 px-2 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs font-medium text-base-content/70">
                                                Image {index + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Inspiration Images Section (if any) */}
                                {generationDetail.inspirationImages && generationDetail.inspirationImages.length > 0 && (
                                    <>
                                        <h3 className="text-lg font-semibold mb-4 mt-8">Inspiration Images</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {generationDetail.inspirationImages.map((img, index) => (
                                                <div 
                                                    key={index} 
                                                    className="group relative aspect-square rounded-2xl overflow-hidden bg-base-100 hover:shadow-lg transition-all duration-300"
                                                >
                                                    {/* Background blur effect */}
                                                    <div 
                                                        className="absolute inset-0 bg-cover bg-center blur-xl opacity-20 scale-110 transition-transform group-hover:scale-125"
                                                        style={{ backgroundImage: `url(${img})` }}
                                                    />
                                                    
                                                    {/* Main image */}
                                                    <div className="relative h-full w-full p-2">
                                                        <div className="relative h-full w-full rounded-xl overflow-hidden bg-white">
                                                            <Image
                                                                src={img}
                                                                alt={`Inspiration ${index + 1}`}
                                                                fill
                                                                className="object-contain hover:scale-105 transition-transform duration-300"
                                                                sizes="(max-width: 1024px) 50vw, 25vw"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Hover overlay */}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300">
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            <button 
                                                                className="btn btn-circle btn-ghost btn-sm bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white border-0"
                                                                onClick={() => window.open(img, '_blank')}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Image type badge */}
                                                    <div className="absolute top-3 left-3 px-2 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs font-medium text-base-content/70">
                                                        Inspiration {index + 1}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Generation Details Accordion */}
                        <div className="bg-white rounded-3xl shadow-sm border border-base-200 overflow-hidden">
                            <button 
                                className="w-full p-6 flex items-center justify-between hover:bg-base-100/50 transition-colors"
                                onClick={() => setShowDetails(!showDetails)}
                            >
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-semibold">Generation Settings</h3>
                                    <div className="badge badge-neutral">View Details</div>
                                </div>
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    className={`h-5 w-5 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            {showDetails && (
                                <div className="p-6 border-t border-base-200">
                                    <div className="grid grid-cols-1 gap-4">
                                        {/* Style & Layout */}
                                        <div className="bg-base-100 rounded-xl p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Style */}
                                                <div>
                                                    <p className="text-sm font-medium text-base-content/70 mb-1">Style</p>
                                                    <div className="bg-white rounded-lg p-3 border border-base-200">
                                                        <p className="text-base-content">
                                                            {getStyleName(generationDetail.style)}
                                                            {!Object.values(STYLE_PRESETS).some(
                                                                preset => preset.description === generationDetail.style
                                                            ) && (
                                                                <span className="block text-sm text-base-content/70 mt-1">
                                                                    {generationDetail.style}
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Aspect Ratio */}
                                                <div>
                                                    <p className="text-sm font-medium text-base-content/70 mb-1">Aspect Ratio</p>
                                                    <div className="bg-white rounded-lg p-3 border border-base-200">
                                                        <p className="text-base-content">{generationDetail.aspectRatio}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Text Settings */}
                                        {generationDetail.textInfo && Object.values(generationDetail.textInfo).some(value => value) && (
                                            <div className="bg-base-100 rounded-xl p-4">
                                                <p className="text-sm font-medium text-base-content/70 mb-2">Text Settings</p>
                                                <div className="bg-white rounded-lg p-3 border border-base-200 space-y-2">
                                                    {generationDetail.textInfo.mainText && (
                                                        <p className="text-base-content">
                                                            <span className="font-medium">Main:</span> {generationDetail.textInfo.mainText}
                                                        </p>
                                                    )}
                                                    {generationDetail.textInfo.secondaryText && (
                                                        <p className="text-base-content">
                                                            <span className="font-medium">Secondary:</span> {generationDetail.textInfo.secondaryText}
                                                        </p>
                                                    )}
                                                    {generationDetail.textInfo.position && (
                                                        <p className="text-base-content">
                                                            <span className="font-medium">Position:</span> {generationDetail.textInfo.position}
                                                        </p>
                                                    )}
                                                    {generationDetail.textInfo.styleNotes && (
                                                        <p className="text-base-content">
                                                            <span className="font-medium">Style Notes:</span> {generationDetail.textInfo.styleNotes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Descriptions */}
                                        <div className="bg-base-100 rounded-xl p-4">
                                            <p className="text-sm font-medium text-base-content/70 mb-2">Descriptions</p>
                                            <div className="bg-white rounded-lg p-3 border border-base-200 space-y-3">
                                                <div>
                                                    <p className="font-medium mb-1">Ad Description</p>
                                                    <p className="text-base-content">{generationDetail.description}</p>
                                                </div>
                                                <div className="pt-2 border-t border-base-200">
                                                    <p className="font-medium mb-1">Product Description</p>
                                                    <p className="text-base-content">{generationDetail.productDescription}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Generation Info */}
                                        <div className="bg-base-100 rounded-xl p-4">
                                            <p className="text-sm font-medium text-base-content/70 mb-2">Generation Info</p>
                                            <div className="bg-white rounded-lg p-3 border border-base-200">
                                                <div className="flex flex-wrap gap-4">
                                                    <div>
                                                        <span className="font-medium">Status:</span>{' '}
                                                        <span className={`badge ${
                                                            generationDetail.status === 'completed' 
                                                                ? 'badge-success' 
                                                                : generationDetail.status === 'processing' 
                                                                    ? 'badge-warning' 
                                                                    : 'badge-error'
                                                        }`}>
                                                            {generationDetail.status.charAt(0).toUpperCase() + generationDetail.status.slice(1)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Generated:</span>{' '}
                                                        <span>{new Date(generationDetail.createdAt).toLocaleString()}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Images Used:</span>{' '}
                                                        <span>{generationDetail.productImages.length} product, {generationDetail.inspirationImages.length} inspiration</span>
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

                {/* Edit Modal */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-xl">
                            <h3 className="text-2xl font-bold mb-4">Edit Advertisement</h3>
                            <p className="text-base-content/70 mb-6">
                                Describe what changes you&apos;d like to make to the advertisement. We&apos;ll use the same settings and images to generate a new version.
                            </p>
                            <textarea
                                className="textarea textarea-bordered w-full h-32 mb-6 rounded-xl"
                                placeholder="Describe the changes you want..."
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                            />
                            <div className="flex justify-end gap-3">
                                <button 
                                    className="btn btn-ghost"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditDescription('');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="btn btn-primary"
                                    onClick={async () => {
                                        await handleRegenerateImage(editDescription);
                                        setIsEditModalOpen(false);
                                        setEditDescription('');
                                    }}
                                >
                                    Generate New Version
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 