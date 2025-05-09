'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthContextProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import GenerationNotification from "@/components/GenerationNotification";
import { createContext, useContext } from "react";

const inter = Inter({ subsets: ["latin"] });

// Create a context for the current generation ID
interface GenerationContextType {
  currentGenerationId: string | null;
  setCurrentGenerationId: (id: string | null) => void;
}

const GenerationContext = createContext<GenerationContextType>({
  currentGenerationId: null,
  setCurrentGenerationId: () => {},
});

// Export a hook to use the generation context
export const useGeneration = () => useContext(GenerationContext);

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading, needsOnboarding } = useAuth();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isOnboardingPage = pathname === '/onboarding';
  const showNavbar = pathname !== "/login" && pathname !== "/signup" && pathname !== "/onboarding";
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);
  const router = useRouter();

  // Handle onboarding redirects with improved logging
  useEffect(() => {
    if (!loading && user && needsOnboarding) {
      // Only redirect if not already on onboarding page and not on login page
      if (!isOnboardingPage && !isLoginPage) {
        console.log('User needs onboarding - redirecting from', pathname, 'to /onboarding');
        router.push('/onboarding');
      }
    } else if (!loading && user) {
      console.log('User onboarding status:', needsOnboarding ? 'needs onboarding' : 'completed onboarding');
    }
  }, [user, loading, needsOnboarding, isOnboardingPage, isLoginPage, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <GenerationContext.Provider value={{ currentGenerationId, setCurrentGenerationId }}>
      {showNavbar && !isLoginPage && !user && <Navbar />}
      {!isLoginPage && !isOnboardingPage && user && <Sidebar />}
      <div className={`min-h-screen bg-base-300 ${!isLoginPage && !isOnboardingPage && user ? 'pl-64' : ''}`}>
        {children}
      </div>
      {!isLoginPage && !isOnboardingPage && !user && <Footer />}
      {user && !isOnboardingPage && <GenerationNotification generationId={currentGenerationId || undefined} />}
    </GenerationContext.Provider>
  );
}

function ClientSideLayout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <html lang="en" data-theme={isClient ? undefined : "light"} className="h-full">
      <body className={`${inter.className} h-full bg-base-300`}>
        <AuthContextProvider>
          <ThemeProvider>
            <NotificationProvider>
              <RootLayoutContent>{children}</RootLayoutContent>
              <Toaster position="top-right" />
            </NotificationProvider>
          </ThemeProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientSideLayout>{children}</ClientSideLayout>;
}
