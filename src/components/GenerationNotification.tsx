import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { useAuth } from '@/context/AuthContext';
import { GenerationDocument } from '@/types/generation';

interface GenerationNotificationProps {
  generationId?: string;
}

interface NotificationState {
  id: string;
  title: string;
  message: string;
  status: 'processing' | 'completed' | 'error';
  imageUrl?: string;
  seen: boolean;
}

const GenerationNotification: React.FC<GenerationNotificationProps> = ({ generationId: propGenerationId }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [activeNotification, setActiveNotification] = useState<NotificationState | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);
  
  // Hide notification when on gallery page
  const isGalleryPage = pathname === '/gallery';

  // Set up Firestore subscription when generation ID changes
  useEffect(() => {
    // Clear any existing notification when a new ID is provided
    if (propGenerationId) {
      console.log(`Generation notification: New ID received: ${propGenerationId}`);
      setCurrentGenerationId(propGenerationId);
    } else if (propGenerationId === undefined || propGenerationId === null) {
      // If prop is explicitly null/undefined, clear the notification
      console.log('Generation notification: Clearing notification due to null ID');
      setCurrentGenerationId(null);
      setActiveNotification(null);
      setIsVisible(false);
    }
  }, [propGenerationId]);

  // Subscribe to Firestore with the generation ID
  useEffect(() => {
    if (!user || !currentGenerationId) return;

    console.log(`Generation notification: Setting up Firestore subscription for ID: ${currentGenerationId}`);
    const generationRef = doc(db, 'generations', user.uid, 'items', currentGenerationId);
    
    // Initial notification state for processing
    setActiveNotification({
      id: currentGenerationId,
      title: 'Generating Ad',
      message: 'Your ad is being generated. This may take a minute...',
      status: 'processing',
      seen: false
    });
    
    setIsVisible(!isGalleryPage);

    // Subscribe to Firestore updates
    const unsubscribe = onSnapshot(
      generationRef, 
      (docSnapshot) => {
        if (!docSnapshot.exists()) {
          console.log(`Document for generation ${currentGenerationId} does not exist yet`);
          return;
        }
        
        const data = docSnapshot.data() as GenerationDocument;
        console.log(`Generation ${currentGenerationId} status update from Firestore:`, {
          status: data.status,
          hasImage: !!data.generatedImageUrl,
          error: data.error
        });
        
        if (data.status === 'completed') {
          console.log(`Generation ${currentGenerationId} COMPLETED with image: ${data.generatedImageUrl}`);
          // Force React to re-render by creating a new object
          setActiveNotification({
            id: currentGenerationId,
            title: 'Ad Generated',
            message: 'Your ad has been successfully generated! Click below to view it.',
            status: 'completed',
            imageUrl: data.generatedImageUrl,
            seen: false
          });
          // Show notification on completion, but not if we're on the gallery page
          setIsVisible(!isGalleryPage);
        } else if (data.status === 'error') {
          console.log(`Generation ${currentGenerationId} ERROR: ${data.error}`);
          setActiveNotification({
            id: currentGenerationId,
            title: 'Generation Failed',
            message: data.error 
              ? `Error: ${data.error}` 
              : 'There was an error generating your ad. Please try again.',
            status: 'error',
            seen: false
          });
          // Always show errors
          setIsVisible(true);
        } else if (data.status === 'processing') {
          console.log(`Generation ${currentGenerationId} still PROCESSING`);
          setActiveNotification({
            id: currentGenerationId,
            title: 'Generating Ad',
            message: 'Your ad is being generated. This may take a minute...',
            status: 'processing',
            seen: false
          });
          // Hide processing notification on gallery page
          setIsVisible(!isGalleryPage);
        }
      },
      (error) => {
        console.error(`Error in Firestore subscription for ${currentGenerationId}:`, error);
        setActiveNotification({
          id: currentGenerationId,
          title: 'Error',
          message: 'Failed to track generation status. Please check the gallery later.',
          status: 'error',
          seen: false
        });
        // Always show errors
        setIsVisible(true);
      }
    );

    return () => {
      console.log(`Cleaning up Firestore subscription for ${currentGenerationId}`);
      unsubscribe();
    };
  }, [user, currentGenerationId, isGalleryPage]);

  // Update visibility when pathname changes
  useEffect(() => {
    if (activeNotification) {
      if (isGalleryPage && activeNotification.status === 'processing') {
        setIsVisible(false);
      } else if (!isGalleryPage) {
        setIsVisible(true);
      }
    }
  }, [pathname, activeNotification, isGalleryPage]);

  // Handle notification closing
  useEffect(() => {
    if (!isVisible && activeNotification) {
      const timer = setTimeout(() => {
        if (activeNotification.status !== 'processing') {
          setCurrentGenerationId(null);
          setActiveNotification(null);
        }
      }, 300); // Wait for animation to complete
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, activeNotification]);

  // Debug current notification state
  useEffect(() => {
    if (activeNotification) {
      console.log(`Active notification state changed: ID=${activeNotification.id}, Status=${activeNotification.status}, HasImage=${!!activeNotification.imageUrl}`);
      
      // Ensure the notification is visible when status changes, except on gallery page for processing status
      if (activeNotification.status === 'completed' || activeNotification.status === 'error') {
        setIsVisible(!isGalleryPage);
      }
    }
  }, [activeNotification, isGalleryPage]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleClick = () => {
    if (activeNotification && activeNotification.status === 'completed') {
      router.push(`/gallery/${activeNotification.id}`);
      setIsVisible(false);
    }
  };

  if (!activeNotification) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'}`}>
      <div className={`bg-base-100 shadow-xl rounded-lg w-80 overflow-hidden border ${
        activeNotification.status === 'completed' ? 'border-green-500' :
        activeNotification.status === 'error' ? 'border-red-500' : 'border-primary'
      }`}>
        {/* Header */}
        <div className={`p-4 ${
          activeNotification.status === 'completed' ? 'bg-green-100 text-green-800' :
          activeNotification.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-primary/10 text-primary'
        } flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            {activeNotification.status === 'completed' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : activeNotification.status === 'error' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <div className="loading loading-spinner loading-xs"></div>
            )}
            <span className="font-medium">{activeNotification.title}</span>
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Body */}
        <div className="p-4">
          <p className="text-sm text-base-content/70 mb-3">{activeNotification.message}</p>
          
          {activeNotification.status === 'completed' && activeNotification.imageUrl && (
            <div className="relative h-32 w-full mb-3 rounded overflow-hidden border border-base-300">
              <Image 
                src={activeNotification.imageUrl} 
                alt="Generated ad"
                fill
                className="object-cover"
              />
            </div>
          )}
          
          {activeNotification.status === 'completed' && (
            <button 
              onClick={handleClick}
              className="btn btn-primary btn-sm w-full"
            >
              View Ad
            </button>
          )}
          
          {activeNotification.status === 'processing' && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-base-content/60">This may take a minute...</span>
              <button 
                onClick={() => router.push('/gallery')}
                className="btn btn-ghost btn-xs"
              >
                Go to Gallery
              </button>
            </div>
          )}
          
          {activeNotification.status === 'error' && (
            <button 
              onClick={() => router.push('/generate')}
              className="btn btn-outline btn-error btn-sm w-full"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerationNotification;