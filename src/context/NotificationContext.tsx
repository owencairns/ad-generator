import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { onSnapshot, collection, query, where, limit } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { useAuth } from './AuthContext';
import { GenerationStatus } from '@/types/generation';

export interface Notification {
  id: string;
  type: 'generation';
  status: GenerationStatus;
  title: string;
  message: string;
  createdAt: Date;
  imageUrl?: string;
  seen: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'seen'>) => void;
  removeNotification: (id: string) => void;
  markAsSeen: (id: string) => void;
  pendingGenerationIds: string[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingGenerationIds, setPendingGenerationIds] = useState<string[]>([]);
  const { user } = useAuth();
  
  // Use refs to track IDs we've already seen to avoid duplicates
  const notificationIdsRef = useRef<Set<string>>(new Set());
  
  // Effect to reset state when user changes
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setPendingGenerationIds([]);
      notificationIdsRef.current = new Set();
    }
  }, [user]);

  // Effect to listen for processing generations
  useEffect(() => {
    if (!user) return;

    try {
      const generationsRef = collection(db, 'generations', user.uid, 'items');
      // Use either "where" or "orderBy", but not both together without a composite index
      const processingQuery = query(
        generationsRef, 
        where('status', '==', 'processing')
        // Removed the orderBy to avoid needing a composite index
      );

      const unsubscribe = onSnapshot(processingQuery, (snapshot) => {
        const processingIds: string[] = [];
        const newProcessingNotifications: Notification[] = [];
        
        snapshot.forEach(docSnapshot => {
          const docId = docSnapshot.id;
          const data = docSnapshot.data();
          
          processingIds.push(docId);
          
          // Only create a notification if we haven't seen this ID before
          if (!notificationIdsRef.current.has(`processing-${docId}`)) {
            notificationIdsRef.current.add(`processing-${docId}`);
            
            newProcessingNotifications.push({
              id: docId,
              type: 'generation',
              status: 'processing',
              title: 'Processing Ad',
              message: `Your ${data.template || 'custom'} ad is being generated`,
              createdAt: new Date(),
              seen: false
            });
          }
        });
        
        setPendingGenerationIds(processingIds);
        
        if (newProcessingNotifications.length > 0) {
          setNotifications(prev => [...prev, ...newProcessingNotifications]);
        }
      });
      
      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up processing snapshot:", error);
    }
  }, [user]);
  
  // Effect to listen for completed/error generations
  useEffect(() => {
    if (!user) return;
    
    try {
      const generationsRef = collection(db, 'generations', user.uid, 'items');
      // Avoid using orderBy with where without a composite index
      const completedQuery = query(
        generationsRef,
        where('status', 'in', ['completed', 'error']),
        // Removed orderBy to avoid needing a composite index
        limit(10)
      );
      
      const unsubscribe = onSnapshot(completedQuery, (snapshot) => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added' || change.type === 'modified') {
            const docId = change.doc.id;
            const data = change.doc.data();
            const statusKey = `${data.status}-${docId}`;
            
            // Skip if we've already processed this status
            if (notificationIdsRef.current.has(statusKey)) {
              return;
            }
            
            notificationIdsRef.current.add(statusKey);
            
            if (data.status === 'completed' || data.status === 'error') {
              // Update notifications - remove any processing notification and add new one
              setNotifications(prev => {
                const filtered = prev.filter(n => n.id !== docId);
                
                const newNotification: Notification = {
                  id: docId,
                  type: 'generation',
                  status: data.status,
                  title: data.status === 'completed' 
                    ? 'Ad Generation Complete' 
                    : 'Ad Generation Failed',
                  message: data.status === 'completed'
                    ? `Your ${data.template || 'custom'} ad is ready to view`
                    : data.error || 'Something went wrong with your ad generation',
                  createdAt: new Date(),
                  seen: false
                };
                
                if (data.status === 'completed' && data.generatedImageUrl) {
                  newNotification.imageUrl = data.generatedImageUrl;
                }
                
                return [...filtered, newNotification];
              });
            }
          }
        });
      });
      
      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up completed generations snapshot:", error);
    }
  }, [user]);

  // Helper functions to manage notifications
  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'seen'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [
      ...prev,
      {
        ...notification,
        id,
        createdAt: new Date(),
        seen: false
      }
    ]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const markAsSeen = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, seen: true } : notification
      )
    );
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      addNotification, 
      removeNotification, 
      markAsSeen, 
      pendingGenerationIds 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};