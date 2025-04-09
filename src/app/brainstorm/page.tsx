'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import GenerationLoadingState from '@/app/generate/components/GenerationLoadingState';
import { GenerationDocument } from '@/types/generation';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface DisplayMessage {
  content: string;
  isUser: boolean;
}

interface UploadedImage {
  url: string;
  file: File;
}

export default function ChatPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([{
    content: "Hi! I'm your design assistant. I'll help you create the perfect ad. Let's start by discussing your product. What's the name of the product you want to advertise?",
    isUser: false,
  }]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<UploadedImage[]>([]);
  const productInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Listen for generation updates
  useEffect(() => {
    if (isGenerating && user && currentGenerationId) {
      // Subscribe to Firestore updates for the specific generation
      const unsubscribe = onSnapshot(
        doc(db, 'generations', user.uid, 'items', currentGenerationId),
        (doc) => {
          if (doc.exists()) {
            const data = doc.data() as GenerationDocument;
            
            if (data.status === 'completed') {
              // Immediately redirect to the generation detail page
              router.push(`/generate/${currentGenerationId}`);
              setIsGenerating(false);
            } else if (data.status === 'error') {
              setGenerationError(data.error || 'An error occurred during generation');
              setIsGenerating(false);
            }
          }
        }
      );

      return () => unsubscribe();
    }
  }, [isGenerating, user, currentGenerationId, router]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isProcessing) return;

    setIsProcessing(true);

    // Add user message to both display and API messages
    const userMessage: Message = { role: 'user', content: message };
    const newMessages = [...messages, userMessage];

    setDisplayMessages(prev => [...prev, { content: message, isUser: true }]);

    try {
      const response = await fetch('http://localhost:3001/api/brainstorm/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Add assistant's response to both arrays
      const assistantMessage: Message = { role: 'assistant', content: data.response };
      setMessages([...newMessages, assistantMessage]);
      setDisplayMessages(prev => [...prev, { content: data.response, isUser: false }]);
      setIsComplete(data.isComplete);

    } catch (error) {
      console.error('Chat error:', error);
      setDisplayMessages(prev => [
        ...prev,
        { 
          content: 'Sorry, there was an error processing your message. Please try again.',
          isUser: false 
        }
      ]);
    }

    setIsProcessing(false);
  };

  const handleProductUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + productImages.length > 2) {
      alert('You can only upload up to 2 product images');
      return;
    }

    const newImages = files.map(file => ({
      url: URL.createObjectURL(file),
      file
    }));
    setProductImages([...productImages, ...newImages]);

    // Send a message to the AI about the uploaded images
    const imageCount = productImages.length + newImages.length;
    handleSendMessage(`I've uploaded ${imageCount} product image${imageCount > 1 ? 's' : ''}.`);
  };

  const removeProductImage = (index: number) => {
    const newImages = [...productImages];
    URL.revokeObjectURL(newImages[index].url);
    newImages.splice(index, 1);
    setProductImages(newImages);

    // Inform the AI about the removed image
    handleSendMessage(`I've removed a product image. Now I have ${newImages.length} image${newImages.length !== 1 ? 's' : ''}.`);
  };

  const handleGenerateAd = async () => {
    if (!user) {
      alert('Please log in to generate ads');
      router.push('/login');
      return;
    }

    if (productImages.length === 0) {
      alert('At least one product image is required. Please upload a product image before generating the ad.');
      return;
    }

    // Get the last message from the AI which contains the summary
    const lastAiMessage = displayMessages
      .filter(msg => !msg.isUser)
      .pop();

    if (!lastAiMessage) return;

    // Generate a new generation ID using timestamp
    const newGenerationId = Date.now().toString();

    try {
      setIsGenerating(true);
      setGenerationError(null);
      setCurrentGenerationId(newGenerationId);

      // Convert images to base64
      const productImagesBase64 = await Promise.all(
        productImages.map(async (img) => {
          const buffer = await img.file.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          return `data:${img.file.type};base64,${base64}`;
        })
      );

      const requestData = {
        description: lastAiMessage.content,
        productDescription: lastAiMessage.content,
        productName: "Generated from Brainstorm",
        productImages: productImagesBase64,
        inspirationImages: [],
        userId: user.uid,
        generationId: newGenerationId,
        style: "default",
        aspectRatio: "1:1",
        textInfo: {
          mainText: "",
          secondaryText: "",
          position: "",
          styleNotes: ""
        }
      };

      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.data?.error || 'Failed to start generation');
      }

      console.log('Generation started successfully');
    } catch (error) {
      console.error('Error starting generation:', error);
      setIsGenerating(false);
      setCurrentGenerationId(null);
      setGenerationError(error instanceof Error ? error.message : 'An unknown error occurred');
      alert('Failed to start generation. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content/70">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  if (isGenerating) {
    return <GenerationLoadingState />;
  }

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <div className="p-4 border-b border-base-300">
        <h1 className="text-2xl font-bold">Create Your Ad</h1>
        <p className="text-base-content/70">
          Chat with our AI assistant to design your perfect advertisement
        </p>
      </div>

      {generationError && (
        <div className="p-4">
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{generationError}</span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {displayMessages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message.content}
            isUser={message.isUser}
          />
        ))}
      </div>

      {/* Product Images Section */}
      <div className="p-4 border-t border-base-300">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Product Images</h3>
            <button
              onClick={() => productInputRef.current?.click()}
              className="btn btn-sm btn-outline"
              disabled={productImages.length >= 2}
            >
              Upload Image
            </button>
            <input
              ref={productInputRef}
              type="file"
              accept="image/*"
              onChange={handleProductUpload}
              className="hidden"
            />
          </div>
          
          {productImages.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {productImages.map((image, index) => (
                <div key={index} className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={image.url}
                    alt={`Product ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeProductImage(index)}
                    className="absolute -top-2 -right-2 bg-base-100 rounded-full p-1 shadow-md hover:bg-base-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 border-2 border-dashed rounded-lg text-base-content/70">
              Upload at least one product image to generate your ad
            </div>
          )}
        </div>
      </div>

      {isComplete && (
        <div className="p-4 border-t border-base-300 bg-base-200">
          <button
            onClick={handleGenerateAd}
            className="btn btn-primary w-full"
            disabled={productImages.length === 0}
          >
            Generate Ad
          </button>
        </div>
      )}

      <ChatInput onSendMessage={handleSendMessage} disabled={isProcessing} />
    </div>
  );
} 