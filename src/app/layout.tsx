'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthContextProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const showNavbar = pathname !== "/login" && pathname !== "/signup";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <>
      {showNavbar && !isLoginPage && !user && <Navbar />}
      {!isLoginPage && user && <Sidebar />}
      <div className={`min-h-screen ${!isLoginPage && user ? 'pl-64' : ''}`}>
        {children}
      </div>
      {!isLoginPage && !user && <Footer />}
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html data-theme="corporate" lang="en">
      <body className={inter.className}>
        <AuthContextProvider>
          <ThemeProvider>
            <RootLayoutContent>{children}</RootLayoutContent>
            <Toaster position="bottom-right" />
          </ThemeProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
