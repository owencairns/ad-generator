'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthContextProvider } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html data-theme="corporate" lang="en">
      <body className={inter.className}>
        <AuthContextProvider>
          {!isLoginPage && <Navbar />}
          <div className="min-h-screen">
            {children}
          </div>
          {!isLoginPage && <Footer />}
          <Toaster position="bottom-right" />
        </AuthContextProvider>
      </body>
    </html>
  );
}
