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
} from '@/types/generation';
import { STYLE_PRESETS } from '../../generate/constants/styles';

interface GenerationDetail {
    id: string;
    description: string;
    productDescription: string;
    productName?: string;
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
    versions?: {
        createdAt: string;
        imageUrl?: string;
        editDescription?: string;
        status: GenerationStatus;
        error?: string;
        versionId?: string;
    }[];
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

const getAspectRatioClass = (aspectRatio?: string): string => {
    // Default to square if no aspect ratio is provided
    if (!aspectRatio) return 'aspect-square';
    
    switch (aspectRatio) {
        case '16:9':
            return 'aspect-video';
        case '9:16':
            return 'aspect-[9/16]';
        case '1:1':
        default:
            return 'aspect-square';
    }
};

export default function GenerationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);

    const router = useRouter();
    const { user, loading } = useAuth();
    const [generationDetail, setGenerationDetail] = useState<GenerationDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editDescription, setEditDescription] = useState('');
    const [showDetails, setShowDetails] = useState(false);
    const [showFullscreen, setShowFullscreen] = useState(false);
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
    const [fullscreenType, setFullscreenType] = useState<'generated' | 'source'>('generated');
    const [activeVersionIndex, setActiveVersionIndex] = useState<number>(0);
    const [editingVersion, setEditingVersion] = useState(false);

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
                        productName: data.productName || `Ad ${docSnap.id.substring(0, 6)}`,
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
                        textInfo: data.textInfo,
                        versions: data.versions?.map((version) => ({
                            ...version,
                            createdAt: version.createdAt instanceof Timestamp
                                ? version.createdAt.toDate().toISOString()
                                : new Date().toISOString()
                        }))
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
            // Set editing state for the version rather than full page loading
            setEditingVersion(true);
            setIsEditModalOpen(false);
            
            const response = await fetch('/api/edit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    editDescription,
                    sourceImageUrl: generationDetail.generatedImage,
                    generationId: generationDetail.id,
                    userId: user.uid,
                    description: generationDetail.description,
                    productDescription: generationDetail.productDescription
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Display a user-friendly error message
                const errorMessage = data.data?.error || 'Failed to edit image';
                
                // No refresh needed for error case since we're removing the failed version
                setEditingVersion(false);
                
                // Use a toast library or alert for immediate feedback
                alert(errorMessage);
                throw new Error(errorMessage);
            }

            // Refresh the current page to see the updated generation
            // We don't need to redirect since we're updating the same document
            window.location.reload();
        } catch (err) {
            console.error('Error editing image:', err);
            setError(err instanceof Error ? err.message : 'Failed to edit image');
            setEditingVersion(false);
        }
    };

    const handleVersionSelect = (imageUrl: string | undefined, index: number) => {
        if (imageUrl) {
            // Create a new object with the same properties but update generatedImage
            setGenerationDetail(prev => prev ? { ...prev, generatedImage: imageUrl } : null);
            setActiveVersionIndex(index);
        }
    };

    const handlePreviousVersion = () => {
        if (!generationDetail?.versions || generationDetail.versions.length <= 1) return;
        
        // Get sorted versions array
        const sortedVersions = [...generationDetail.versions].sort((a, b) => {
            if (a.versionId === 'original') return -1;
            if (b.versionId === 'original') return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        // Calculate previous index with wraparound
        const prevIndex = (activeVersionIndex - 1 + sortedVersions.length) % sortedVersions.length;
        const prevVersion = sortedVersions[prevIndex];
        
        if (prevVersion.imageUrl && prevVersion.status !== 'processing') {
            handleVersionSelect(prevVersion.imageUrl, prevIndex);
        }
    };

    const handleNextVersion = () => {
        if (!generationDetail?.versions || generationDetail.versions.length <= 1) return;
        
        // Get sorted versions array
        const sortedVersions = [...generationDetail.versions].sort((a, b) => {
            if (a.versionId === 'original') return -1;
            if (b.versionId === 'original') return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        // Calculate next index with wraparound
        const nextIndex = (activeVersionIndex + 1) % sortedVersions.length;
        const nextVersion = sortedVersions[nextIndex];
        
        if (nextVersion.imageUrl && nextVersion.status !== 'processing') {
            handleVersionSelect(nextVersion.imageUrl, nextIndex);
        }
    };

    if (loading) {
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

    if (!generationDetail || isLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="text-base-content/70">Loading generation details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-300">
            {/* Top Navigation */}
            <div className="container mx-auto px-6 py-6 opacity-0 animate-fade-in">
                <div className="flex justify-between items-center">
                    <Link href="/gallery" className="text-base-content/70 hover:text-base-content flex items-center gap-2 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Gallery
                    </Link>
                </div>
            </div>

            {/* Title and Metadata */}
            <div className="container mx-auto px-6 mb-8 opacity-0 animate-fade-in [animation-delay:150ms]">
                <div className="max-w-[1600px] mx-auto">
                    <h1 className="text-3xl font-bold text-base-content mb-4">{generationDetail.productName}</h1>
                    <div className="flex items-center gap-6 text-base-content/70">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{new Date(generationDetail.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                            </svg>
                            <span>{Object.values(STYLE_PRESETS).some(
                                preset => preset.description === generationDetail.style
                            ) ? getStyleName(generationDetail.style) : 'Custom Template'}</span>
                        </div>
                        <div className="flex items-center gap-3 ml-auto">
                            <button className="btn btn-sm btn-ghost gap-2 normal-case" data-tip="Download Image">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>Download</span>
                            </button>
                            <button className="btn btn-sm btn-ghost gap-2 normal-case" data-tip="Copy Share Link">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                <span>Share</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 pb-24">
                <div className="flex flex-col lg:flex-row gap-12 max-w-[1600px] mx-auto">
                    {/* Left Column - Image and Actions */}
                    <div className="w-full lg:w-[60%] opacity-0 translate-y-4 animate-slide-up [animation-delay:600ms]">
                        {/* Image Card */}
                        <div className="bg-base-100 rounded-3xl overflow-hidden border border-base-300 shadow-sm">
                            {/* Generated Image */}
                            <div className={`relative ${getAspectRatioClass(generationDetail?.aspectRatio)} bg-base-200`}>
                                {generationDetail?.generatedImage && !editingVersion ? (
                                    <div className="group relative h-full w-full">
                                        <Image
                                            src={generationDetail.generatedImage}
                                            alt={`${generationDetail.productName || 'Product'} Advertisement`}
                                            fill
                                            className="object-contain"
                                            sizes="(max-width: 1024px) 100vw, 60vw"
                                            priority
                                        />
                                        <div className="absolute bottom-4 left-4 px-3 py-1 text-xs font-medium bg-base-100/80 backdrop-blur-[2px] rounded-full text-base-content/70">
                                            {generationDetail.versions && generationDetail.versions.length > 0 
                                                ? `${
                                                    generationDetail.versions.find(v => v.imageUrl === generationDetail.generatedImage)?.versionId === 'original'
                                                    ? 'Original Version'
                                                    : 'Latest Version'
                                                }`
                                                : 'Original Version'
                                            }
                                        </div>
                                        <button 
                                            onClick={() => setShowFullscreen(true)}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <div className="btn btn-circle bg-base-100/90 hover:bg-base-100 border-0 shadow-lg">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2m8-18h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="loading loading-spinner loading-lg text-primary"></span>
                                        {editingVersion && (
                                            <p className="mt-4 text-base-content/70 text-sm">Creating new version based on your edits...</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Variations Filmstrip */}
                            <div className="border-t border-base-300 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-base-content/70 font-medium">Previous Versions</h3>
                                        <button 
                                            onClick={() => setIsEditModalOpen(true)}
                                            className="btn btn-ghost btn-sm gap-2" 
                                            disabled={editingVersion}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                            {editingVersion ? 'Creating new version...' : 'Edit & Create New Version'}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            className="btn btn-circle btn-sm btn-ghost"
                                            onClick={handlePreviousVersion}
                                            disabled={!generationDetail?.versions || generationDetail.versions.length <= 1 || editingVersion}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button 
                                            className="btn btn-circle btn-sm btn-ghost"
                                            onClick={handleNextVersion}
                                            disabled={!generationDetail?.versions || generationDetail.versions.length <= 1 || editingVersion}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="overflow-x-auto -mx-2 px-2 py-1">
                                        <div className="flex gap-3">
                                            {/* If editing, show a placeholder for the new version */}
                                            {editingVersion && (
                                                <div className="relative group cursor-not-allowed ring-2 ring-primary/50 shadow-md shadow-primary/10 rounded-lg transition-all duration-200 m-1">
                                                    <div className="w-24 h-24 relative flex-shrink-0 bg-base-200 rounded-lg border border-base-300 overflow-hidden">
                                                        <div className="absolute inset-0 flex items-center justify-center bg-base-200">
                                                            <span className="loading loading-spinner text-primary"></span>
                                                        </div>
                                                    </div>
                                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-base-100/90 backdrop-blur-sm rounded-full text-xs font-medium text-base-content/70">
                                                        New Version
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Show actual versions if they exist */}
                                            {generationDetail.versions && generationDetail.versions.length > 0 ? (
                                                // Sort versions: original first, then by date (newest first)
                                                [...generationDetail.versions]
                                                .sort((a, b) => {
                                                    if (a.versionId === 'original') return -1;
                                                    if (b.versionId === 'original') return 1;
                                                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                                                })
                                                .map((version, index) => {
                                                    // Use the main image for original version if needed
                                                    const isOriginal = version.versionId === 'original';
                                                    const displayImage = 
                                                        isOriginal && !version.imageUrl && generationDetail.generatedImage
                                                            ? generationDetail.generatedImage 
                                                            : version.imageUrl;
                                                            
                                                    return (
                                                        <div 
                                                            key={version.versionId || index} 
                                                            className={`relative group cursor-pointer ${
                                                                // Enhanced selection indicator with better visual treatment - rounded to match the image
                                                                displayImage === generationDetail.generatedImage 
                                                                    ? 'ring-2 ring-primary shadow-md shadow-primary/20 rounded-lg' 
                                                                    : 'hover:ring-1 hover:ring-primary/50 hover:shadow-sm rounded-lg'
                                                            } transition-all duration-200 m-1`}
                                                            onClick={() => {
                                                                if (displayImage && version.status !== 'processing') {
                                                                    handleVersionSelect(displayImage, index);
                                                                }
                                                            }}
                                                        >
                                                            <div className="w-24 h-24 relative flex-shrink-0 bg-base-200 rounded-lg border border-base-300 overflow-hidden">
                                                                {version.status === 'processing' ? (
                                                                    <div className="absolute inset-0 flex items-center justify-center bg-base-200">
                                                                        <span className="loading loading-spinner text-primary"></span>
                                                                    </div>
                                                                ) : displayImage ? (
                                                                    <Image
                                                                        src={displayImage}
                                                                        alt={isOriginal ? "Original version" : `Version ${index + 1}`}
                                                                        fill
                                                                        className="object-contain"
                                                                        sizes="96px"
                                                                    />
                                                                ) : version.status === 'error' ? (
                                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                                        </svg>
                                                                    </div>
                                                                ) : (
                                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-base-100/90 backdrop-blur-sm rounded-full text-xs font-medium text-base-content/70">
                                                                {isOriginal ? 'Original' : index === 0 ? 'Latest' : ''}
                                                            </div>
                                                            {version.status === 'processing' && (
                                                                <div className="absolute inset-0 bg-base-100/60 backdrop-blur-[1px] flex items-center justify-center">
                                                                    <div className="text-xs text-center px-2">
                                                                        Processing...
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {version.editDescription && version.status !== 'processing' && (
                                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-base-100/90 backdrop-blur-sm flex items-center justify-center p-2">
                                                                    <div className="text-xs text-center line-clamp-4">
                                                                        {version.editDescription}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                // If no versions exist, show the original as the only version
                                                <div 
                                                    className="relative group cursor-pointer ring-2 ring-primary shadow-md shadow-primary/20 transition-all duration-200 m-1 rounded-lg"
                                                    onClick={() => setShowFullscreen(true)}
                                                >
                                                    <div className="w-24 h-24 relative flex-shrink-0 bg-base-200 rounded-lg border border-base-300 overflow-hidden">
                                                        {generationDetail.generatedImage ? (
                                                            <Image
                                                                src={generationDetail.generatedImage}
                                                                alt="Original version"
                                                                fill
                                                                className="object-contain"
                                                                sizes="96px"
                                                            />
                                                        ) : (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-base-100/90 backdrop-blur-sm rounded-full text-xs font-medium text-base-content/70">
                                                        Original
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="w-full lg:w-[40%] space-y-8">
                        {/* Description */}
                        <div className="opacity-0 translate-y-4 animate-slide-up [animation-delay:800ms]">
                            <h3 className="text-lg text-base-content/70 mb-2">Description</h3>
                            <p className="text-base-content text-lg">{generationDetail.description}</p>
                        </div>

                        {/* Source Images */}
                        <div className="opacity-0 translate-y-4 animate-slide-up [animation-delay:1000ms]">
                            <h3 className="text-lg text-base-content/70 mb-4">Source Images</h3>
                            <div className="relative">
                                <div className="overflow-x-auto pb-4 -mx-2 px-2">
                                    <div className="flex gap-4">
                                        {generationDetail.productImages.map((img, index) => (
                                            <div key={index} className="relative group">
                                                <div className="w-40 h-40 relative flex-shrink-0 bg-base-100 rounded-xl border border-base-300 overflow-hidden">
                                                    <Image
                                                        src={img}
                                                        alt={`Product ${index + 1}`}
                                                        fill
                                                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                                                        sizes="160px"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setShowFullscreen(true);
                                                        setFullscreenImage(img);
                                                        setFullscreenType('source');
                                                    }}
                                                    className="absolute top-2 right-2 btn btn-circle btn-xs bg-base-100/90 hover:bg-base-100 border-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2m8-18h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2" />
                                                    </svg>
                                                </button>
                                                <div className="absolute top-2 left-2 px-2 py-1 bg-base-100/90 backdrop-blur-sm rounded-full text-xs font-medium text-base-content/70">
                                                    Product {index + 1}
                                                </div>
                                            </div>
                                        ))}
                                        {generationDetail.inspirationImages?.map((img, index) => (
                                            <div key={index} className="relative group">
                                                <div className="w-40 h-40 relative flex-shrink-0 bg-base-100 rounded-xl border border-base-300 overflow-hidden">
                                                    <Image
                                                        src={img}
                                                        alt={`Inspiration ${index + 1}`}
                                                        fill
                                                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                                                        sizes="160px"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setShowFullscreen(true);
                                                        setFullscreenImage(img);
                                                        setFullscreenType('source');
                                                    }}
                                                    className="absolute top-2 right-2 btn btn-circle btn-xs bg-base-100/90 hover:bg-base-100 border-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2m8-18h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2" />
                                                    </svg>
                                                </button>
                                                <div className="absolute top-2 left-2 px-2 py-1 bg-base-100/90 backdrop-blur-sm rounded-full text-xs font-medium text-base-content/70">
                                                    Inspiration {index + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Generation Details */}
                        <div className="opacity-0 translate-y-4 animate-slide-up [animation-delay:1200ms]">
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

                                    <div className="pt-4">
                                        <Link 
                                            href={`/generate/similar/${generationDetail.id}`}
                                            className="btn btn-primary gap-2 w-full"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Create Similar Ad
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(16px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.4s ease-out forwards;
                }

                .animate-slide-up {
                    animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                [animation-delay="150ms"] { animation-delay: 150ms; }
                [animation-delay="600ms"] { animation-delay: 600ms; }
                [animation-delay="800ms"] { animation-delay: 800ms; }
                [animation-delay="1000ms"] { animation-delay: 1000ms; }
                [animation-delay="1200ms"] { animation-delay: 1200ms; }
                
                /* Ensure no white space at the bottom */
                html, body {
                    min-height: 100%;
                    background-color: hsl(var(--b300));
                }
            `}</style>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-base-content/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-base-100 rounded-3xl max-w-2xl w-full mx-4 overflow-hidden animate-slide-up">
                        <div className="bg-base-200 border-b border-base-300 p-6">
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 p-3 rounded-xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-base-content">Create New Version</h3>
                                    <p className="text-base-content/70 mt-1">Describe the changes you want to make to generate a new version</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="form-control">
                                <textarea
                                    className="textarea w-full min-h-[160px] text-base bg-base-200 rounded-2xl border-base-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 placeholder:text-base-content/40 resize-none p-6"
                                    placeholder="Example: Make the lighting more dramatic, move the product to the right, add more contrast..."
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                />
                                <label className="label px-1 mt-2">
                                    <span className="text-sm text-base-content/60">Be specific about what you want to change</span>
                                    <span className="text-sm text-base-content/60">{editDescription.length} characters</span>
                                </label>
                            </div>
                            <div className="bg-base-200 p-4 rounded-xl mt-4">
                                <div className="flex items-center gap-2 text-sm text-base-content/70 mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium">Note:</span>
                                </div>
                                <p className="text-sm text-base-content/70">This will create a new version of your ad while preserving the original. All versions will be accessible in the version history.</p>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
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
                                    className="btn btn-primary gap-2"
                                    onClick={async () => {
                                        await handleRegenerateImage(editDescription);
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Generate New Version
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Fullscreen Image Modal */}
            {showFullscreen && (
                <div className="fixed inset-0 bg-base-300/95 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in p-4">
                    <div className="absolute top-4 right-4 z-10">
                        <button 
                            onClick={() => {
                                setShowFullscreen(false);
                                setFullscreenImage(null);
                            }}
                            className="btn btn-circle btn-ghost text-base-content"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="relative max-h-[90vh] max-w-[90vw]">
                        {fullscreenType === 'source' && fullscreenImage ? (
                            <Image
                                src={fullscreenImage}
                                alt="Source Image"
                                className="object-contain max-h-[90vh] max-w-[90vw]"
                                width={1200}
                                height={1200}
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : fullscreenImage ? (
                            <Image
                                src={fullscreenImage}
                                alt="Generated Ad Version"
                                className={`object-contain max-h-[90vh] max-w-[90vw] ${getAspectRatioClass(generationDetail?.aspectRatio)}`}
                                width={1200}
                                height={1200}
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : generationDetail?.generatedImage && (
                            <Image
                                src={generationDetail.generatedImage}
                                alt="Generated Ad"
                                className={`object-contain max-h-[90vh] max-w-[90vw] ${getAspectRatioClass(generationDetail?.aspectRatio)}`}
                                width={1200}
                                height={1200}
                                onClick={(e) => e.stopPropagation()}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 