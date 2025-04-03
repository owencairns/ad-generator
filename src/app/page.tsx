import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-base-100 text-base-content overflow-x-hidden">

      {/* Hero Section */}
      <section className="bg-base-100 py-12 md:py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-base-content mb-6">
              Build ads, <span className="italic">lose effort</span>,<br />
              <span className="text-primary">feel unstoppable.</span>
            </h1>
            <p className="text-xl text-base-content/80 mb-8 max-w-2xl mx-auto">
              20-minute transformations designed specifically for
              ambitious, busy marketers. Feel confident, professional,
              clearer—without spending hours.
            </p>
            <button className="btn btn-primary btn-lg shadow-md mb-4 px-8">
              Create Better Today
            </button>
            <p className="text-sm text-base-content/60">*7 Days free trial. Cancel anytime</p>
          </div>

          {/* Before/After Showcase */}
          <div className="mt-16 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-base-200 rounded-full px-6 py-2 z-10 font-bold">
                Before
              </div>
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src="/before.png"
                  alt="Before - Raw product photo taken on phone"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* After */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-primary rounded-full px-6 py-2 z-10 font-bold text-primary-content">
                After
              </div>
              <div className="relative aspect-[3/4] w-full">
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

    </main>
  );
}