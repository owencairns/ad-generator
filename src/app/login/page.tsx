'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';
import LoginButton from '@/components/LoginButton';
import AuthForm from '@/components/AuthForm';
import OrDivider from '@/components/OrDivider';

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    if (user) {
      router.push('/'); // Redirect to home page if user is already logged in
    }
  }, [user, router]);

  return (
    <main className="min-h-screen flex relative">
      {/* Full-page background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white to-indigo-50/80 z-0"></div>
      
      {/* Left side (Login Form) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 z-10">
        <div className="max-w-md w-full">
          <div className="mb-8">
            <Image 
              src={theme === 'dark' ? '/images/logos/logo-dark.png' : '/images/logos/logo-light.png'}
              alt="Logo"
              width={120}
              height={36}
              className="h-10 w-auto mb-8"
            />
            <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-2 text-sm text-gray-600">Please enter your details</p>
          </div>
          
          <div className="space-y-6">
            <LoginButton />
            
            <OrDivider />
            
            <AuthForm />
          </div>
        </div>
      </div>
      
      {/* Right side (Image Collage) - Hidden on mobile */}
      <div className="hidden md:block md:w-1/2 relative overflow-hidden z-10">
        {/* Additional right-side gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/30 via-purple-50/40 to-blue-100/50"></div>
        {/* Subtle radial gradient for depth */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-indigo-100/20 to-blue-200/20"></div>
        
        {/* Image Collage */}
        <div className="absolute inset-0 p-8 flex items-center justify-center">
          {/* Top Left - Purse Ad */}
          <div 
            className="absolute z-30 animate-float shadow-xl rounded-xl overflow-hidden transform -rotate-3 collage-shadow-medium" 
            style={{ 
              width: '45%', 
              height: '38%', 
              top: '5%', 
              left: '8%'
            }}
          >
            <Image
              src="/images/login/login2.png"
              alt="New Drop - Fashion Ad"
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-xl collage-blur-edge"
            />
          </div>

          {/* Top Right - Perfume */}
          <div 
            className="absolute z-50 animate-float-delayed shadow-lg rounded-xl overflow-hidden transform rotate-2 collage-shadow-soft" 
            style={{ 
              width: '32%', 
              height: '36%', 
              top: '6%', 
              right: '8%'
            }}
          >
            <Image
              src="/images/login/login1.png"
              alt="Perfume Product"
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-xl"
            />
          </div>

          {/* Center - Sweatshirt */}
          <div 
            className="absolute z-30 animate-float-slow shadow-2xl rounded-xl overflow-hidden collage-shadow-strong" 
            style={{ 
              width: '60%', 
              height: '50%', 
              top: '28%', 
              left: '25%'
            }}
          >
            <Image
              src="/images/login/login3.png"
              alt="Product Showcase"
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-xl"
              priority
            />
          </div>

          {/* Bottom Left - Drink */}
          <div 
            className="absolute z-30 animate-float-reverse shadow-lg rounded-xl overflow-hidden transform -rotate-2 collage-shadow-medium" 
            style={{ 
              width: '42%', 
              height: '35%', 
              bottom: '8%', 
              left: '5%'
            }}
          >
            <Image
              src="/images/login/login4.png"
              alt="Lifestyle Product"
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-xl"
            />
          </div>

          {/* Bottom Right - Sale Banner */}
          <div 
            className="absolute z-20 animate-float-slow-reverse shadow-lg rounded-xl overflow-hidden transform rotate-3 collage-shadow-soft" 
            style={{ 
              width: '35%', 
              height: '28%', 
              bottom: '5%', 
              right: '8%'
            }}
          >
            <Image
              src="/images/login/login5.png"
              alt="Sale Banner"
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-xl collage-blur-edge"
            />
          </div>
        </div>

        {/* Text overlay at the bottom */}
        <div className="absolute inset-x-0 bottom-0 z-40 p-8 bg-gradient-to-t from-black/50 via-black/30 to-transparent">
          <h2 className="text-3xl font-bold mb-2 text-white drop-shadow-md">Bring your products to market.</h2>
          <p className="text-sm text-white/90 drop-shadow-md">
            Grow your audience with eye-catching ads that convert. Sign up and start creating today.
          </p>
        </div>
      </div>
    </main>
  );
} 