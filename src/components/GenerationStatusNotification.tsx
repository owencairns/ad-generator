import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/app/firebase';

interface GenerationStatusNotificationProps {
  generationId: string;
}

const GenerationStatusNotification: React.FC<GenerationStatusNotificationProps> = ({ 
  generationId 
}) => {
  const [status, setStatus] = useState<'processing' | 'completed' | 'error' | null>(null);
  const [visible, setVisible] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!user || !generationId) return;
    
    // Subscribe to this specific generation's status changes
    const unsubscribe = onSnapshot(
      doc(db, 'generations', user.uid, 'items', generationId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          
          // Only show notification when completed or error
          if (data.status === 'completed' || data.status === 'error') {
            setStatus(data.status);
            setVisible(true);
            
            // Hide after 10 seconds
            setTimeout(() => {
              setVisible(false);
            }, 10000);
          }
        }
      },
      (error) => {
        console.error(`Error watching generation ${generationId}:`, error);
      }
    );
    
    return () => unsubscribe();
  }, [user, generationId]);
  
  const handleClose = () => {
    setVisible(false);
  };
  
  const handleView = () => {
    if (status === 'completed') {
      router.push(`/gallery/${generationId}`);
    }
    setVisible(false);
  };
  
  if (!visible || !status) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-base-100 shadow-lg rounded-lg p-4 w-80 border border-base-300 transition-all duration-300">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-base-content">
          {status === 'completed' ? 'Generation Complete' : 'Generation Failed'}
        </h3>
        <button onClick={handleClose} className="btn btn-ghost btn-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <p className="text-sm text-base-content/70 mb-3">
        {status === 'completed' 
          ? 'Your ad generation is complete!' 
          : 'There was an error generating your ad.'}
      </p>
      
      {status === 'completed' && (
        <button 
          onClick={handleView}
          className="btn btn-primary btn-sm w-full"
        >
          View Ad
        </button>
      )}
    </div>
  );
};

export default GenerationStatusNotification;