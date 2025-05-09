'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { collection, query, limit, onSnapshot, where, QuerySnapshot, DocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../firebase';
import { GenerationDocument, GenerationStatus } from '@/types/generation';
import { Timestamp } from 'firebase/firestore';
import { Inter } from 'next/font/google';
import { useNotifications } from '@/context/NotificationContext';
import GenerationLoadingCard from '@/components/GenerationLoadingCard';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

const inter = Inter({ subsets: ['latin'] });

// Define interface for generation data in the Gallery
interface GalleryGeneration {
    id: string;
    description: string;
    imageUrl: string | null;
    status: GenerationStatus;
    createdAt: string;
    productName?: string;
    template?: string;
}

// Interface for grouped generations
interface GroupedGenerations {
    [key: string]: GalleryGeneration[];
}

export default function GalleryPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { } = useNotifications();
    const [completedGenerations, setCompletedGenerations] = useState<GalleryGeneration[]>([]);
    const [groupedGenerations, setGroupedGenerations] = useState<GroupedGenerations>({});
    const [pendingGenerations, setPendingGenerations] = useState<GalleryGeneration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedGenerationId, setSelectedGenerationId] = useState<string | null>(null);

    // First effect: redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Second effect: Load completed generations
    useEffect(() => {
        if (!user) return;

        setLoading(true);
        setError(null);

        // Reference to user's generations collection
        const generationsRef = collection(db, 'generations', user.uid, 'items');
        
        // Query for completed generations - avoiding composite index requirement
        const completedQuery = query(
            generationsRef, 
            where('status', 'in', ['completed', 'error']),
            // Removed orderBy from query to avoid needing a composite index
            // We'll sort the results in JavaScript instead
            limit(30) // Increased limit to get more items for sorting
        );

        // Real-time listener for completed generations
        const unsubscribe = onSnapshot(
            completedQuery,
            (snapshot: QuerySnapshot<DocumentData>) => {
                const generationsData: GalleryGeneration[] = snapshot.docs.map(doc => {
                    const data = doc.data() as GenerationDocument;
                    return {
                        id: doc.id,
                        description: data.description,
                        imageUrl: data.generatedImageUrl || null,
                        status: data.status,
                        createdAt: data.createdAt instanceof Timestamp
                            ? data.createdAt.toDate().toISOString()
                            : new Date().toISOString(),
                        productName: data.productName || `Ad ${doc.id.substring(0, 6)}`,
                        template: data.template
                    };
                });

                // Sort generations by date (newest first)
                generationsData.sort((a, b) => {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });

                // Group generations by time period
                const grouped: GroupedGenerations = {};
                
                generationsData.forEach(generation => {
                    const timeGroup = getTimeGroup(generation.createdAt);
                    
                    if (!grouped[timeGroup]) {
                        grouped[timeGroup] = [];
                    }
                    
                    grouped[timeGroup].push(generation);
                });

                setCompletedGenerations(generationsData);
                setGroupedGenerations(grouped);
                setLoading(false);
            },
            (err: Error) => {
                console.error('Error fetching generations:', err);
                setError('Failed to load your generations. Please try again later.');
                setLoading(false);
            }
        );

        return () => {
            unsubscribe();
        };
    }, [user]);

    // Third effect: Handle pending generations
    useEffect(() => {
        if (!user) {
            setPendingGenerations([]);
            return;
        }

        try {
            // Query for processing generations
            const generationsRef = collection(db, 'generations', user.uid, 'items');
            const processingQuery = query(
                generationsRef,
                where('status', '==', 'processing')
            );

            // Create a single subscription for all processing generations
            const unsubscribe = onSnapshot(
                processingQuery,
                (snapshot: QuerySnapshot<DocumentData>) => {
                    // Build a new array of pending generations
                    const newPendingGenerations: GalleryGeneration[] = [];
                    
                    snapshot.forEach((docSnapshot: DocumentSnapshot<DocumentData>) => {
                        const data = docSnapshot.data() as GenerationDocument;
                        
                        newPendingGenerations.push({
                            id: docSnapshot.id,
                            description: data.description,
                            imageUrl: data.generatedImageUrl || null,
                            status: data.status,
                            createdAt: data.createdAt instanceof Timestamp
                                ? data.createdAt.toDate().toISOString()
                                : new Date().toISOString(),
                            productName: data.productName || `Ad ${docSnapshot.id.substring(0, 6)}`,
                            template: data.template
                        });
                    });
                    
                    // Replace the entire array at once
                    setPendingGenerations(newPendingGenerations);
                },
                (err: Error) => {
                    console.error(`Error fetching pending generations:`, err);
                }
            );

            // Clean up subscription
            return () => unsubscribe();
        } catch (error) {
            console.error("Error setting up pending generation listener:", error);
            return () => {};
        }
    }, [user]);

    // Format relative time for display in generation card
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
    
    // Get group label for a date (used for section headers)
    const getTimeGroup = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return 'This Week';
        if (diffInDays < 14) return 'Last Week';
        if (diffInDays < 30) return 'This Month';
        if (diffInDays < 60) return 'Last Month';
        if (diffInDays < 365) return 'This Year';
        return 'Older';
    };
    
    // Handle generation deletion
    const handleDeleteGeneration = async (generationId: string) => {
        try {
            if (!user || deletingIds.has(generationId)) return;
            
            // Add to deleting set to prevent duplicate requests
            setDeletingIds(prev => new Set(prev).add(generationId));
            
            // Get the ID token from Firebase
            const idToken = await user.getIdToken();
            
            // Call the API to delete the generation
            const response = await fetch(`/api/generations/${generationId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
            });
            
            if (!response.ok) {
                throw new Error(`Failed to delete generation: ${response.statusText}`);
            }
            
            // Remove from frontend state
            setCompletedGenerations(prev => 
                prev.filter(gen => gen.id !== generationId)
            );
            
            // Update grouped generations
            setGroupedGenerations(prev => {
                const newGrouped = { ...prev };
                
                // For each time group, filter out the deleted generation
                Object.keys(newGrouped).forEach(timeGroup => {
                    newGrouped[timeGroup] = newGrouped[timeGroup].filter(
                        gen => gen.id !== generationId
                    );
                    
                    // Remove empty groups
                    if (newGrouped[timeGroup].length === 0) {
                        delete newGrouped[timeGroup];
                    }
                });
                
                return newGrouped;
            });
            
            // Close modal after successful deletion
            setDeleteModalOpen(false);
            setSelectedGenerationId(null);
        } catch (err) {
            console.error('Error deleting generation:', err);
            alert('Failed to delete generation. Please try again.');
        } finally {
            // Remove from deleting set
            setDeletingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(generationId);
                return newSet;
            });
        }
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
        <div className={`container mx-auto px-6 py-12 ${inter.className}`}>
            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal 
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setSelectedGenerationId(null);
                }}
                onConfirm={() => {
                    if (selectedGenerationId) {
                        handleDeleteGeneration(selectedGenerationId);
                    }
                }}
                isDeleting={selectedGenerationId ? deletingIds.has(selectedGenerationId) : false}
            />

            <div className="flex flex-col gap-12">
                {/* Gallery Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h1 className="text-3xl font-semibold text-base-content">Your Ads</h1>
                    <Link 
                        href="/generate" 
                        className="btn btn-primary rounded-full px-8 normal-case text-base font-medium hover:scale-105 transition-transform"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1">
                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                        New Ad
                    </Link>
                </div>

                {/* Error message */}
                {error && (
                    <div className="alert alert-error shadow-sm rounded-2xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                            <span>{error}</span>
                            <div className="mt-2">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="btn btn-sm btn-outline rounded-full normal-case"
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
                {/* Processing/Pending Generations Section */}
                {pendingGenerations.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-xl font-semibold mb-4 text-base-content/90">Processing</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {pendingGenerations.map((generation) => (
                                <GenerationLoadingCard 
                                    key={generation.id} 
                                    template={generation.template}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Completed Generations Section */}
                {!loading && completedGenerations.length > 0 ? (
                    <div>
                        {pendingGenerations.length > 0 && (
                            <h2 className="text-xl font-semibold mb-4 text-base-content/90">Completed</h2>
                        )}
                        
                        {/* Group by time periods */}
                        {Object.keys(groupedGenerations).map((timeGroup) => (
                            <div key={timeGroup} className="mb-12">
                                <h2 className="text-xl font-semibold mb-6 text-base-content/90 border-b border-base-300 pb-2">
                                    {timeGroup}
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
                                    {groupedGenerations[timeGroup].map((generation) => (
                                        <div key={generation.id} className="relative group">
                                            <Link
                                                href={`/gallery/${generation.id}`}
                                                className="block group relative bg-base-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
                                            >
                                                <figure className="relative aspect-square bg-base-200 overflow-hidden">
                                                    {generation.imageUrl ? (
                                                        <Image
                                                            src={generation.imageUrl}
                                                            alt={`Ad ${generation.id}`}
                                                            fill
                                                            className="object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
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
                                                <div className="p-6">
                                                    <div className="flex justify-between items-start gap-4 mb-3">
                                                        <h2 className="text-base font-semibold text-base-content line-clamp-1">{generation.productName}</h2>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <span className={`w-2 h-2 rounded-full ${
                                                                generation.status === 'completed' ? 'bg-success/70' :
                                                                generation.status === 'processing' ? 'bg-warning/70' :
                                                                'bg-error/70'
                                                            }`}></span>
                                                            <span className="text-base-content/70">{generation.status}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-base-content/70 line-clamp-2 mb-4">
                                                        {generation.description}
                                                    </p>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-base-content/50">
                                                            {formatRelativeTime(generation.createdAt)}
                                                        </span>
                                                        <div className="flex items-center gap-3">
                                                            <button 
                                                                className="text-base-content/50 hover:text-error transition-colors duration-200"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setSelectedGenerationId(generation.id);
                                                                    setDeleteModalOpen(true);
                                                                }}
                                                                aria-label="Delete generation"
                                                                disabled={deletingIds.has(generation.id)}
                                                            >
                                                                {deletingIds.has(generation.id) ? (
                                                                    <span className="loading loading-spinner loading-xs"></span>
                                                                ) : (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                            <span className="text-sm text-primary font-medium">View Details →</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !loading && !error && pendingGenerations.length === 0 ? (
                    <div className="bg-base-200/50 rounded-2xl p-10 text-center">
                        <div className="max-w-md mx-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <h3 className="text-xl font-semibold mb-2">No ads yet</h3>
                            <p className="text-base-content/70 mb-6">You haven&apos;t created any ads yet. Get started by creating your first ad.</p>
                            <Link 
                                href="/generate" 
                                className="btn btn-primary rounded-full px-8 normal-case text-base font-medium hover:scale-105 transition-transform"
                            >
                                Create Your First Ad
                            </Link>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
} 