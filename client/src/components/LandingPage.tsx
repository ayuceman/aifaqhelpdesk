import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLoadDemo: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLoadDemo }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation */}
      <nav className="relative z-10 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold text-slate-900">AI FAQ Generator</span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="/demo" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Demo</a>
              <a href="/contact" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Contact</a>
              <a href="/privacy" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Privacy</a>
              <a href="/terms" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Terms</a>
              <button
                onClick={onGetStarted}
                className="btn-primary"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse-slow"></span>
              Enterprise-Grade AI Solutions
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 mb-8 leading-tight animate-fade-in">
              Transform Content Into
              <span className="block text-gradient-primary">Intelligent FAQ Systems</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in">
              Enterprise-ready AI FAQ generation platform. Transform documents and websites into 
              intelligent FAQ systems and chatbot assistants for instant customer support.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-scale-in">
              <button
                onClick={onGetStarted}
                className="btn-primary text-lg px-8 py-4"
              >
                Start Building
              </button>
              <a
                href="/demo"
                className="btn-secondary text-lg px-8 py-4"
              >
                View Demo
              </a>
              <button
                onClick={onLoadDemo}
                className="btn-ghost text-lg px-8 py-4"
              >
                Try Now
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-12 text-sm text-slate-500 animate-fade-in">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Enterprise Security
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                SOC 2 Compliant
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                99.9% Uptime
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Four simple steps to deploy intelligent FAQ systems and chatbot assistants across your organization
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card p-8 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Upload Content</h3>
              <p className="text-slate-600 leading-relaxed">
                Upload documents, crawl websites, or connect to your knowledge base. 
                Supports PDF, DOCX, TXT, and Markdown formats.
              </p>
            </div>

            <div className="card p-8 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">AI Generation</h3>
              <p className="text-slate-600 leading-relaxed">
                Advanced AI analyzes your content and generates contextually relevant 
                FAQ pairs and intelligent responses with customizable tone.
              </p>
            </div>

            <div className="card p-8 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Review & Edit</h3>
              <p className="text-slate-600 leading-relaxed">
                Fine-tune generated FAQs and responses with our intuitive editor. Add, edit, or 
                remove questions to match your brand voice and requirements.
              </p>
            </div>

            <div className="card p-8 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 mx-auto">
                4
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Deploy Widget</h3>
              <p className="text-slate-600 leading-relaxed">
                Deploy intelligent FAQ widgets and chatbot assistants across your websites, apps, and 
                platforms with simple embed codes and API integration.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Enterprise Features
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Built for scale, security, and performance at enterprise levels
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card p-8">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Lightning Fast</h3>
              <p className="text-slate-600">
                Process documents and websites in minutes with our optimized AI models. 
                Built for speed and efficiency at enterprise scale.
              </p>
            </div>

            <div className="card p-8">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Enterprise Security</h3>
              <p className="text-slate-600">
                SOC 2 compliant with end-to-end encryption. Your data stays secure 
                and private at all times.
              </p>
            </div>

            <div className="card p-8">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Smart Integration</h3>
              <p className="text-slate-600">
                Seamlessly integrate with your existing tools and workflows. 
                API-first architecture for maximum flexibility.
              </p>
            </div>

            <div className="card p-8">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Analytics & Insights</h3>
              <p className="text-slate-600">
                Track performance, user engagement, and content effectiveness 
                with detailed analytics and reporting.
              </p>
            </div>

            <div className="card p-8">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Customizable</h3>
              <p className="text-slate-600">
                White-label solutions with custom branding, themes, and 
                styling to match your organization's identity.
              </p>
            </div>

            <div className="card p-8">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">24/7 Support</h3>
              <p className="text-slate-600">
                Dedicated enterprise support with SLA guarantees. 
                Expert assistance when you need it most.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Embed Code Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Get Your Embed Code
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Copy and paste this code into your website to deploy your AI FAQ widget instantly
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Code Preview */}
            <div className="card-elevated p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Embed Code</h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`<iframe 
  src="http://localhost:3001/widget?project=demo" 
  width="400" 
  height="600" 
  frameborder="0"
  title="AI FAQ Assistant">
</iframe>`);
                    // You could add a toast notification here
                  }}
                  className="btn-ghost text-sm px-4 py-2"
                >
                  📋 Copy Code
                </button>
              </div>
              
              <div className="bg-slate-900 rounded-lg p-6 overflow-x-auto">
                <pre className="text-green-400 text-sm font-mono leading-relaxed">
{`<iframe 
  src="http://localhost:3001/widget?project=demo" 
  width="400" 
  height="600" 
  frameborder="0"
  title="AI FAQ Assistant">
</iframe>`}
                </pre>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      <strong>Pro Tip:</strong> Replace "demo" with your project slug to use your custom FAQ data.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="card-elevated p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Live Preview</h3>
              
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <div className="w-full max-w-sm mx-auto">
                  <iframe 
                    src="http://localhost:3001/widget?project=demo" 
                    width="100%" 
                    height="400" 
                    frameBorder="0"
                    title="AI FAQ Assistant Preview"
                    className="rounded-lg shadow-sm"
                  />
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600 mb-4">
                  Try asking: "What are your business hours?" or "How do I contact support?"
                </p>
                <button
                  onClick={onLoadDemo}
                  className="btn-primary text-sm px-6 py-2"
                >
                  Try Full Demo
                </button>
              </div>
            </div>
          </div>
          
          {/* Quick Start Steps */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-slate-900 text-center mb-8">
              Quick Start Guide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Create Your FAQs</h4>
                <p className="text-slate-600 text-sm">
                  Upload documents or crawl websites to generate intelligent FAQ content
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold text-lg">2</span>
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Customize & Deploy</h4>
                <p className="text-slate-600 text-sm">
                  Review, edit, and publish your FAQs to get your embed code
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold text-lg">3</span>
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Embed & Go Live</h4>
                <p className="text-slate-600 text-sm">
                  Copy the embed code to your website and start helping customers instantly
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Support?
          </h2>
          <p className="text-xl text-slate-300 mb-12">
            Join thousands of enterprises already using AI FAQ Generator to deliver 
            exceptional customer experiences with intelligent FAQ systems and chatbot assistants.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="btn-primary bg-white text-slate-900 hover:bg-slate-100 text-lg px-8 py-4"
            >
              Start Free Trial
            </button>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-transparent border-2 border-white rounded-lg shadow-sm hover:bg-white hover:text-slate-900 transition-all duration-200"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <span className="text-xl font-bold text-slate-900">AI FAQ Generator</span>
              </div>
              <p className="text-slate-600 text-sm">
                Enterprise-grade AI FAQ generation platform for modern organizations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="/demo" className="hover:text-slate-900 transition-colors">Demo</a></li>
                <li><button onClick={onGetStarted} className="text-left hover:text-slate-900 transition-colors">Get Started</button></li>
                <li><button onClick={onLoadDemo} className="text-left hover:text-slate-900 transition-colors">Try Demo</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="/contact" className="hover:text-slate-900 transition-colors">Contact</a></li>
                <li><a href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</a></li>
                <li><a href="/terms" className="hover:text-slate-900 transition-colors">Terms</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="/contact" className="hover:text-slate-900 transition-colors">Contact Support</a></li>
                <li><a href="/demo" className="hover:text-slate-900 transition-colors">Live Demo</a></li>
                <li><button onClick={onGetStarted} className="text-left hover:text-slate-900 transition-colors">Get Started</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 mt-12 pt-8 text-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} AI FAQ Generator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;