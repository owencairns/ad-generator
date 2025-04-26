'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/gallery');
    }
  }, [user, loading, router]);

  // If loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // If user is logged in, this will be briefly shown before redirect
  if (user) {
    return null;
  }

  // Show landing page for non-logged in users
  return (
    <main className="min-h-screen bg-base-100 text-base-content overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-base-100 to-base-200 py-16 md:py-24">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-primary/10 rounded-full px-4 py-1.5 flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></span>
                <span className="text-sm font-medium text-primary">AI-Powered Ad Creation</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-base-content to-base-content/90">E<span className="text-primary">AD</span>SY</span>
              <span className="block mt-2">Stunning ads in seconds</span>
            </h1>
            <p className="text-xl text-base-content/80 mb-8 max-w-2xl mx-auto">
              Transform your product photos into professional advertisements with AI. 
              Create compelling marketing visuals in seconds, not hours.
            </p>
            <div className="flex gap-4 justify-center mb-6">
              <Link href="/signup" className="btn btn-primary btn-lg rounded-full px-8 normal-case text-base font-medium hover:scale-105 transition-transform shadow-lg shadow-primary/20">
                Start Creating Free
              </Link>
              <Link href="#how-it-works" className="btn btn-outline btn-lg rounded-full px-8 normal-case text-base font-medium hover:bg-base-200">
                See How It Works
              </Link>
            </div>
            <p className="text-sm text-base-content/60">*7-day free trial. No credit card required.</p>
          </div>
        </div>
        
        {/* Floating shapes animation */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-24 h-24 rounded-3xl bg-primary/5 rotate-12 animate-float-slow"></div>
          <div className="absolute top-[60%] left-[80%] w-32 h-32 rounded-full bg-secondary/5 animate-float-medium"></div>
          <div className="absolute top-[30%] left-[85%] w-20 h-20 rounded-md bg-accent/5 -rotate-12 animate-float-fast"></div>
        </div>
      </section>

      {/* Transformation Showcase */}
      <section className="py-16 bg-base-100" id="transform">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Magical Transformations</h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              Watch your simple product photos turn into professional marketing materials in seconds
            </p>
          </div>

          <div className="mt-16 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Before */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-base-300 bg-base-200/50 p-1 transform transition-all hover:scale-[1.01]">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-base-200 rounded-full px-6 py-2 z-10 font-bold border border-base-300 shadow-md">
                Before
              </div>
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden">
                <Image
                  src="/before.png"
                  alt="Before - Raw product photo taken on phone"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* After */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-primary/20 bg-base-200/50 p-1 transform transition-all hover:scale-[1.01]">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-primary rounded-full px-6 py-2 z-10 font-bold text-primary-content shadow-md shadow-primary/20">
                After
              </div>
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden">
                <Image
                  src="/after.tiff"
                  alt="After - Professional quality ad"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Style Gallery */}
      <section className="py-16 bg-base-200" id="styles">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Style, Your Brand</h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              Choose from dozens of styles to match your brand identity
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            <div className="relative rounded-xl overflow-hidden aspect-square shadow-md hover:shadow-xl transition-all hover:scale-[1.02]">
              <Image 
                src="/images/style-examples/example-retro.png" 
                alt="Retro style ad" 
                fill 
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white font-medium">Retro</p>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-square shadow-md hover:shadow-xl transition-all hover:scale-[1.02]">
              <Image 
                src="/images/style-examples/example-minimalist.png" 
                alt="Minimalist style ad" 
                fill 
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white font-medium">Minimalist</p>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-square shadow-md hover:shadow-xl transition-all hover:scale-[1.02]">
              <Image 
                src="/images/style-examples/example-3d.png" 
                alt="3D style ad" 
                fill 
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white font-medium">3D</p>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-square shadow-md hover:shadow-xl transition-all hover:scale-[1.02]">
              <Image 
                src="/images/style-examples/example-cartoon.png" 
                alt="Cartoon style ad" 
                fill 
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white font-medium">Cartoon</p>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-square shadow-md hover:shadow-xl transition-all hover:scale-[1.02]">
              <Image 
                src="/images/style-examples/example-fr.png" 
                alt="Fashion style ad" 
                fill 
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white font-medium">Fashion</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-base-100" id="how-it-works">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How EADSY Works</h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              Three simple steps to transform your product photos into stunning advertisements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-base-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all hover:translate-y-[-5px]">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Upload</h3>
              <p className="text-base-content/70">
                Upload your product photos or choose from our stock library
              </p>
            </div>

            <div className="bg-base-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all hover:translate-y-[-5px]">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Customize</h3>
              <p className="text-base-content/70">
                Select your style, add text, and customize your ad layout
              </p>
            </div>

            <div className="bg-base-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all hover:translate-y-[-5px]">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Generate</h3>
              <p className="text-base-content/70">
                Our AI transforms your photo into a professional advertisement in seconds
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-base-200">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              Join thousands of marketers who are saving time and creating better ads
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-base-100 p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                  <span className="font-bold text-primary">S</span>
                </div>
                <div>
                  <p className="font-bold">Sarah T.</p>
                  <p className="text-sm text-base-content/60">Marketing Director</p>
                </div>
              </div>
              <p className="text-base-content/80">
                &ldquo;EADSY has completely transformed our marketing workflow. What used to take our designer hours now takes me minutes.&rdquo;
              </p>
              <div className="flex mt-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
            </div>

            <div className="bg-base-100 p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                  <span className="font-bold text-primary">J</span>
                </div>
                <div>
                  <p className="font-bold">James L.</p>
                  <p className="text-sm text-base-content/60">E-commerce Owner</p>
                </div>
              </div>
              <p className="text-base-content/80">
                &ldquo;My product listings look so much more professional now. Sales have increased by 32% since I started using EADSY.&rdquo;
              </p>
              <div className="flex mt-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
            </div>

            <div className="bg-base-100 p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                  <span className="font-bold text-primary">M</span>
                </div>
                <div>
                  <p className="font-bold">Maria C.</p>
                  <p className="text-sm text-base-content/60">Social Media Manager</p>
                </div>
              </div>
              <p className="text-base-content/80">
                &ldquo;I create content for 5 different brands, and EADSY lets me maintain consistent quality across all of them in a fraction of the time.&rdquo;
              </p>
              <div className="flex mt-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-base-100">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl p-10 max-w-5xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to create stunning ads?</h2>
            <p className="text-lg mb-8 max-w-xl mx-auto">
              Join thousands of marketers who are creating professional advertisements in seconds with EADSY.
            </p>
            <Link href="/signup" className="btn btn-primary btn-lg rounded-full px-10 normal-case text-base font-medium hover:scale-105 transition-transform shadow-lg shadow-primary/20">
              Start Your Free Trial
            </Link>
            <p className="text-sm text-base-content/60 mt-4">No credit card required. Cancel anytime.</p>
          </div>
        </div>
      </section>

      {/* Add CSS animations */}
      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(12deg); }
          50% { transform: translateY(-20px) rotate(12deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0) rotate(-12deg); }
          50% { transform: translateY(-10px) rotate(-12deg); }
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 6s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 4s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}