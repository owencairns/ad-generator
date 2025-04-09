'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import GenerationLoadingState from '@/app/generate/components/GenerationLoadingState';
import { GenerationDocument } from '@/types/generation';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: { url: string; file: File }[];
  requestImage?: boolean | "product" | "inspiration";
  imagePrompt?: string;
  responseType?: 'text' | 'requestImage';
  readyToGenerate?: boolean;
}

interface DisplayMessage {
  content: string;
  isUser: boolean;
  images?: { url: string; file: File }[];
  requestImage?: boolean | "product" | "inspiration";
  imagePrompt?: string;
  responseType?: 'text' | 'requestImage';
  readyToGenerate?: boolean;
}

export default function ChatPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([{
    content: "Hi! I'm your design assistant. I'll help you create the perfect ad. To get started, please upload product images so I can better understand what we're working with. This will help me provide tailored suggestions for your advertisement.",
    isUser: false,
    requestImage: "product",
    responseType: 'requestImage',
    readyToGenerate: false
  }]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [hasUploadedImages, setHasUploadedImages] = useState(false);

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

  const handleImageUpload = (files: File[], messageIndex: number) => {
    // Create object URLs for the image files
    const imageObjects = files.map(file => ({
      url: URL.createObjectURL(file),
      file
    }));
    
    // Add the images to the message
    const updatedMessages = [...displayMessages];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      images: imageObjects
    };
    
    setDisplayMessages(updatedMessages);
    setHasUploadedImages(true);
    
    // If this is AI's message, also add a user message with the images
    if (!updatedMessages[messageIndex].isUser) {
      handleSendMessageWithImages(files);
    }
  };

  const handleSendMessageWithImages = async (files: File[]) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Convert images to base64
      const imagesData = await Promise.all(
        files.map(async (file) => {
          const buffer = await file.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          return {
            data: `data:${file.type};base64,${base64}`,
            objectUrl: URL.createObjectURL(file),
            file
          };
        })
      );
      
      // Add user message with images to the display
      const imageObjects = imagesData.map(img => ({
        url: img.objectUrl,
        file: img.file
      }));
      
      const userMessage: Message = {
        role: 'user',
        content: `Here ${files.length === 1 ? 'is' : 'are'} the product ${files.length === 1 ? 'image' : 'images'} you requested.`,
        images: imageObjects
      };
      
      const userDisplayMessage: DisplayMessage = {
        content: `Here ${files.length === 1 ? 'is' : 'are'} the product ${files.length === 1 ? 'image' : 'images'} you requested.`,
        isUser: true,
        images: imageObjects
      };
      
      const newMessages = [...messages, userMessage];
      setDisplayMessages(prev => [...prev, userDisplayMessage]);
      setMessages(newMessages);
      
      // Send the first image to the backend (Gemini can only process one image at a time in this version)
      // In a production app, you might want to send multiple API calls or use a more advanced version of Gemini
      const response = await fetch('http://localhost:3001/api/brainstorm/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          image: imagesData[0].data, // Send the first image
          imageCount: imagesData.length // Let the backend know how many images were uploaded
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Process JSON response
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Add safety check for JSON string content that might have escaped parsing
      let content = data.content;
      let responseType = data.responseType;
      let requestImage = data.requestImage;
      let imagePrompt = data.imagePrompt;
      let readyToGenerate = data.readyToGenerate || false;
      
      // Check if the content itself is a JSON string that needs parsing
      if (typeof content === 'string' && content.trim().startsWith('{') && content.trim().endsWith('}')) {
        try {
          console.log('Detected potential JSON string in content, attempting to parse');
          const parsedContent = JSON.parse(content);
          if (parsedContent.content) {
            console.log('Successfully extracted content from nested JSON');
            content = parsedContent.content;
            // Use nested values if available
            responseType = parsedContent.responseType || responseType;
            requestImage = parsedContent.requestImage !== undefined ? parsedContent.requestImage : requestImage;
            imagePrompt = parsedContent.imagePrompt || imagePrompt;
            readyToGenerate = parsedContent.readyToGenerate !== undefined ? parsedContent.readyToGenerate : readyToGenerate;
          }
        } catch (error) {
          console.error('Error parsing nested JSON:', error);
          // Keep the original content if parsing fails
        }
      }
      
      // Add the assistant message with possibly updated values
      const assistantMessage: Message = {
        role: 'assistant',
        content: content,
        requestImage: requestImage,
        imagePrompt: imagePrompt,
        responseType: responseType,
        readyToGenerate: readyToGenerate
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Create display message with the same properties
      const assistantDisplayMessage: DisplayMessage = { 
        content: content, 
        isUser: false,
        requestImage: requestImage,
        imagePrompt: imagePrompt,
        responseType: responseType,
        readyToGenerate: readyToGenerate
      };
      
      setDisplayMessages(prev => [...prev, assistantDisplayMessage]);
    } catch (error) {
      console.error('Chat error with image:', error);
      setDisplayMessages(prev => [
        ...prev,
        {
          content: 'Sorry, there was an error processing your images. Please try again.',
          isUser: false,
        },
      ]);
    }
    
    setIsProcessing(false);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isProcessing) return;

    setIsProcessing(true);

    // Add user message to both display and API messages
    const userMessage: Message = { role: 'user', content: message };
    const newMessages = [...messages, userMessage];

    // Add user message to display messages
    const userDisplayMessage: DisplayMessage = { content: message, isUser: true };
    setDisplayMessages(prev => [...prev, userDisplayMessage]);
    setMessages(newMessages);

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

      // Process JSON response
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Add safety check for JSON string content that might have escaped parsing
      let content = data.content;
      let responseType = data.responseType;
      let requestImage = data.requestImage;
      let imagePrompt = data.imagePrompt;
      let readyToGenerate = data.readyToGenerate || false;
      
      // Check if the content itself is a JSON string that needs parsing
      if (typeof content === 'string' && content.trim().startsWith('{') && content.trim().endsWith('}')) {
        try {
          console.log('Detected potential JSON string in content, attempting to parse');
          const parsedContent = JSON.parse(content);
          if (parsedContent.content) {
            console.log('Successfully extracted content from nested JSON');
            content = parsedContent.content;
            // Use nested values if available
            responseType = parsedContent.responseType || responseType;
            requestImage = parsedContent.requestImage !== undefined ? parsedContent.requestImage : requestImage;
            imagePrompt = parsedContent.imagePrompt || imagePrompt;
            readyToGenerate = parsedContent.readyToGenerate !== undefined ? parsedContent.readyToGenerate : readyToGenerate;
          }
        } catch (error) {
          console.error('Error parsing nested JSON:', error);
          // Keep the original content if parsing fails
        }
      }
      
      // Add the assistant message with possibly updated values
      const assistantMessage: Message = {
        role: 'assistant',
        content: content,
        requestImage: requestImage,
        imagePrompt: imagePrompt,
        responseType: responseType,
        readyToGenerate: readyToGenerate
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Create display message with the same properties
      const assistantDisplayMessage: DisplayMessage = { 
        content: content, 
        isUser: false,
        requestImage: requestImage,
        imagePrompt: imagePrompt,
        responseType: responseType,
        readyToGenerate: readyToGenerate
      };
      
      setDisplayMessages(prev => [...prev, assistantDisplayMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setDisplayMessages(prev => [
        ...prev,
        {
          content: 'Sorry, there was an error processing your message. Please try again.',
          isUser: false,
        },
      ]);
    }

    setIsProcessing(false);
  };

  const handleGenerateAd = async () => {
    if (!user) {
      alert('Please log in to generate ads');
      router.push('/login');
      return;
    }

    // Get the last message from the AI which contains the summary
    const lastAiMessage = displayMessages
      .filter(msg => !msg.isUser)
      .pop();

    if (!lastAiMessage) return;

    // Get all uploaded images from the chat
    const productImages: { url: string; file: File }[] = [];
    
    // Collect all images from user messages
    displayMessages.forEach(msg => {
      if (msg.isUser && msg.images && msg.images.length > 0) {
        productImages.push(...msg.images);
      }
    });

    if (productImages.length === 0) {
      alert('At least one product image is required. Please upload a product image when asked.');
      return;
    }

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
        {displayMessages.map((msg, index) => (
          <ChatMessage
            key={index}
            message={msg.content}
            isUser={msg.isUser}
            onImageUpload={!msg.isUser ? (files) => handleImageUpload(files, index) : undefined}
            uploadedImages={msg.images}
            isFirstMessage={index === 0 && !msg.isUser}
            hasUploadedImages={hasUploadedImages}
            requestImage={msg.requestImage}
            imagePrompt={msg.imagePrompt}
            responseType={msg.responseType}
            readyToGenerate={msg.readyToGenerate}
          />
        ))}
      </div>

      {/* Show generate button based on readyToGenerate flag in the last assistant message */}
      {(() => {
        // Get the last message from the AI
        const lastAiMessage = displayMessages
          .filter(msg => !msg.isUser)
          .pop();
        
        // Only show the generate button if the last AI message has readyToGenerate set to true
        return lastAiMessage?.readyToGenerate && (
          <div className="p-4 border-t border-base-300 bg-base-200">
            <button
              onClick={handleGenerateAd}
              className="btn btn-primary w-full"
              disabled={!hasUploadedImages}
            >
              Generate Ad
            </button>
          </div>
        );
      })()}

      <ChatInput onSendMessage={handleSendMessage} disabled={isProcessing} />
    </div>
  );
} 