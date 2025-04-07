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
            {/* Top Navigation */}
            <div className="container mx-auto px-6 py-6">
                <div className="flex justify-between items-center">
                    <Link href="/gallery" className="text-base-content/70 hover:text-base-content flex items-center gap-2 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Gallery
                    </Link>
                    <Link href="/generate" className="text-base-content/70 hover:text-base-content flex items-center gap-2 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Ad
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-12 max-w-[1600px] mx-auto">
                    {/* Left Column - Image and Actions */}
                    <div className="w-full lg:w-[60%]">
                        {/* Image Card */}
                        <div className="bg-base-100 rounded-3xl overflow-hidden border border-base-300 shadow-sm">
                            {/* Generated Image */}
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
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="loading loading-spinner loading-lg text-primary"></span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="border-t border-base-300">
                                <div className="flex items-center justify-center divide-x divide-base-300">
                                    <button className="flex-1 text-base-content/70 hover:text-primary hover:bg-base-200 transition-all flex items-center justify-center gap-2 py-3 px-8 rounded-full normal-case text-base font-medium hover:scale-105">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        <span>Download</span>
                                    </button>
                                    <button className="flex-1 text-base-content/70 hover:text-primary hover:bg-base-200 transition-all flex items-center justify-center gap-2 py-3 px-8 rounded-full normal-case text-base font-medium hover:scale-105">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                        <span>Share</span>
                                    </button>
                                    <button 
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="flex-1 text-base-content/70 hover:text-primary hover:bg-base-200 transition-all flex items-center justify-center gap-2 py-3 px-4"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                        <span>Edit & Regenerate</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="w-full lg:w-[40%] space-y-8">
                        {/* Description */}
                        <div>
                            <h3 className="text-lg text-base-content/70 mb-2">Description</h3>
                            <p className="text-base-content text-lg">{generationDetail.description}</p>
                        </div>

                        {/* Source Images */}
                        <div>
                            <h3 className="text-lg text-base-content/70 mb-4">Source Images</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {generationDetail.productImages.map((img, index) => (
                                    <div key={index} className="aspect-square relative bg-base-100 rounded-lg border border-base-300">
                                        <Image
                                            src={img}
                                            alt={`Product ${index + 1}`}
                                            fill
                                            className="object-contain"
                                            sizes="(max-width: 1024px) 25vw, 20vw"
                                        />
                                    </div>
                                ))}
                                {generationDetail.inspirationImages?.map((img, index) => (
                                    <div key={index} className="aspect-square relative bg-base-100 rounded-lg border border-base-300">
                                        <Image
                                            src={img}
                                            alt={`Inspiration ${index + 1}`}
                                            fill
                                            className="object-contain"
                                            sizes="(max-width: 1024px) 25vw, 20vw"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Generation Details */}
                        <div>
                            <button 
                                onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center gap-2 text-base-content/70 hover:text-base-content transition-colors"
                            >
                                <span>Generation Details</span>
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
                                <div className="mt-4 space-y-6 text-base-content/70">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <h4 className="font-medium mb-2">Style</h4>
                                            <p>{getStyleName(generationDetail.style)}</p>
                                            {!Object.values(STYLE_PRESETS).some(
                                                preset => preset.description === generationDetail.style
                                            ) && (
                                                <p className="mt-1 text-sm">{generationDetail.style}</p>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium mb-2">Aspect Ratio</h4>
                                            <p>{generationDetail.aspectRatio}</p>
                                        </div>
                                    </div>

                                    {generationDetail.textInfo && Object.values(generationDetail.textInfo).some(value => value) && (
                                        <div>
                                            <h4 className="font-medium mb-2">Text Settings</h4>
                                            <div className="space-y-2">
                                                {generationDetail.textInfo.mainText && (
                                                    <p><span className="text-base-content">Main:</span> {generationDetail.textInfo.mainText}</p>
                                                )}
                                                {generationDetail.textInfo.secondaryText && (
                                                    <p><span className="text-base-content">Secondary:</span> {generationDetail.textInfo.secondaryText}</p>
                                                )}
                                                {generationDetail.textInfo.position && (
                                                    <p><span className="text-base-content">Position:</span> {generationDetail.textInfo.position}</p>
                                                )}
                                                {generationDetail.textInfo.styleNotes && (
                                                    <p><span className="text-base-content">Style Notes:</span> {generationDetail.textInfo.styleNotes}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-base-content/50 flex items-center justify-center z-50">
                    <div className="bg-base-100 p-8 max-w-2xl w-full mx-4">
                        <h3 className="text-2xl mb-4 text-base-content">Edit Advertisement</h3>
                        <textarea
                            className="w-full h-32 mb-6 bg-base-200 p-4 rounded-lg border-base-300 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            placeholder="Describe the changes you want..."
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                        />
                        <div className="flex justify-end gap-6">
                            <button 
                                className="text-base-content/70 hover:text-base-content transition-colors"
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setEditDescription('');
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                className="text-primary hover:text-primary/80 transition-colors"
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
    );
} 