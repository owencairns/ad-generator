export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="hero min-h-[80vh] bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="hero-content flex-col lg:flex-row-reverse max-w-7xl mx-auto px-4 py-12 gap-8">
          <div className="flex-1">
            <div className="relative rounded-lg overflow-hidden shadow-xl bg-base-100">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 z-0"></div>
              <div className="grid grid-cols-2 gap-2 p-2 relative z-10">
                <div className="aspect-square rounded bg-base-200 shadow-inner overflow-hidden">
                  <div className="w-full h-full bg-secondary/10 flex items-center justify-center">
                    <div className="badge badge-secondary">Before</div>
                  </div>
                </div>
                <div className="aspect-square rounded bg-base-200 shadow-inner overflow-hidden">
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <div className="badge badge-primary">After</div>
                  </div>
                </div>
                <div className="aspect-square rounded bg-base-200 shadow-inner overflow-hidden">
                  <div className="w-full h-full bg-accent/10 flex items-center justify-center">
                    <div className="badge badge-accent">Before</div>
                  </div>
                </div>
                <div className="aspect-square rounded bg-base-200 shadow-inner overflow-hidden">
                  <div className="w-full h-full bg-success/10 flex items-center justify-center">
                    <div className="badge badge-success">After</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-5xl font-bold text-base-content">
              <span className="text-primary">Transform</span> your products into
              <span className="text-secondary"> stunning ads</span>
            </h1>
            <p className="py-6 text-base-content/80 text-lg">
              Upload stock imagery of your products and our AI-powered platform will generate beautiful,
              conversion-focused ads tailored to your brand. Save time and boost your marketing impact.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="btn btn-primary btn-lg">Get Started</button>
              <button className="btn btn-outline btn-secondary btn-lg">View Examples</button>
            </div>
            <div className="stats stats-vertical lg:stats-horizontal shadow mt-8 bg-base-200">
              <div className="stat">
                <div className="stat-title">Happy Clients</div>
                <div className="stat-value text-primary">2.4K+</div>
              </div>
              <div className="stat">
                <div className="stat-title">Ads Generated</div>
                <div className="stat-value text-secondary">125K+</div>
              </div>
              <div className="stat">
                <div className="stat-title">Time Saved</div>
                <div className="stat-value text-accent">98%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-base-content">How It Works</h2>
            <p className="text-base-content/70 mt-4 max-w-3xl mx-auto">
              Our platform makes creating professional ads as simple as 1-2-3
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="card-title text-base-content">Upload Product Images</h3>
                <p className="text-base-content/70">
                  Simply upload your product stock photos to our platform.
                </p>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-secondary">2</span>
                </div>
                <h3 className="card-title text-base-content">Customize Settings</h3>
                <p className="text-base-content/70">
                  Choose your ad style, dimensions, and branding elements.
                </p>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-accent">3</span>
                </div>
                <h3 className="card-title text-base-content">Generate & Download</h3>
                <p className="text-base-content/70">
                  Our AI creates multiple ad variations ready to use across platforms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-base-content mb-4">Ready to Transform Your Marketing?</h2>
            <p className="text-base-content/70 mb-8">
              Join thousands of brands who have elevated their advertising using our platform.
            </p>
            <div className="join">
              <input className="input input-bordered join-item" placeholder="Your email address" />
              <button className="btn btn-primary join-item">Start Free Trial</button>
            </div>
            <p className="text-xs text-base-content/50 mt-4">
              No credit card required. 14-day free trial.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
