import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface LandingPageProps {
  onGetStarted: () => void;
  onLoadDemo: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToSignup?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLoadDemo }) => {
  const [loadIframe, setLoadIframe] = React.useState(false);

  // Ensure page stays at top on mount and prevent iframe from stealing focus
  useEffect(() => {
    // Force scroll to top immediately
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    // Delay iframe loading to prevent focus stealing
    const timer = setTimeout(() => {
      setLoadIframe(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <Header variant="landing" />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-40">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-sm font-medium mb-8 animate-fade-in backdrop-blur-sm">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
              Trusted by 10,000+ businesses worldwide
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-white mb-8 leading-tight animate-fade-in">
              Turn Your Docs Into
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 text-transparent bg-clip-text">Instant AI-Powered Answers</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in">
              Generate intelligent FAQs from your content in minutes. Embed a smart chatbot that answers customer questions 24/7.
              <span className="block mt-2 text-blue-300 font-semibold">Reduce repetitive support tickets by 60-70%.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-scale-in">
              <button
                onClick={onGetStarted}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-200"
              >
                <span className="relative z-10">Start Free Trial</span>
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <Link
                to="/demo"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200"
              >
                <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Demo
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-400 animate-fade-in">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white font-medium">No credit card required</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white font-medium">14-day free trial</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white font-medium">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-slate-600 font-medium">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">2M+</div>
              <div className="text-slate-600 font-medium">FAQs Generated</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-slate-600 font-medium">Uptime SLA</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">60-70%</div>
              <div className="text-slate-600 font-medium">Fewer Support Tickets</div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof - Customer Logos */}
      <div className="bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-slate-500 text-sm font-medium mb-8 uppercase tracking-wider">
            Trusted by leading companies
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-60">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-center h-12 bg-slate-200 rounded-lg">
                <span className="text-slate-400 font-bold text-sm">COMPANY {i + 1}</span>
              </div>
            ))}
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
                Advanced AI analyzes your content and generates intelligent FAQ systems, 
                chatbot responses, and conversational capabilities with customizable tone.
              </p>
            </div>

            <div className="card p-8 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Review & Edit</h3>
              <p className="text-slate-600 leading-relaxed">
                Fine-tune generated FAQs and chatbot responses with our intuitive editor. 
                Customize knowledge base and conversational style to match your brand voice.
              </p>
            </div>

            <div className="card p-8 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 mx-auto">
                4
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Deploy & Embed</h3>
              <p className="text-slate-600 leading-relaxed">
                Deploy intelligent FAQ systems and chatbot assistants across your websites, apps, and 
                platforms with simple embed codes and API integration for comprehensive customer support.
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
                  {loadIframe ? (
                    <iframe 
                      src="http://localhost:3001/widget?project=demo" 
                      width="100%" 
                      height="400" 
                      frameBorder="0"
                      title="AI FAQ Assistant Preview"
                      className="rounded-lg shadow-sm"
                      loading="lazy"
                      tabIndex={-1}
                    />
                  ) : (
                    <div className="w-full h-[400px] bg-slate-100 rounded-lg shadow-sm flex items-center justify-center">
                      <div className="text-slate-500">
                        <svg className="animate-spin h-8 w-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-sm">Loading preview...</p>
                      </div>
                    </div>
                  )}
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

      {/* Value Proposition Section */}
      <div className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why AI FAQ Generator?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Transform your knowledge into instant, accurate answers for your customers
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Benefit 1 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Instant Answers</h3>
              <p className="text-slate-600 mb-4">
                Customers get immediate responses 24/7 without waiting for email or support tickets
              </p>
              <div className="text-3xl font-bold text-blue-600">0 sec</div>
              <div className="text-sm text-slate-500">Average response time</div>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Reduce Support Load</h3>
              <p className="text-slate-600 mb-4">
                Handle 60-70% of common questions automatically, freeing your team for complex issues
              </p>
              <div className="text-3xl font-bold text-green-600">60-70%</div>
              <div className="text-sm text-slate-500">Reduction in repetitive tickets</div>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Affordable & Scalable</h3>
              <p className="text-slate-600 mb-4">
                Start at just $39/month and handle unlimited questions as you grow
              </p>
              <div className="text-3xl font-bold text-purple-600">$39</div>
              <div className="text-sm text-slate-500">Starting monthly price</div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="mt-16 max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">Perfect For</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">SaaS Companies</h4>
                  <p className="text-slate-600 text-sm">Answer product questions, onboarding, troubleshooting</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">E-commerce</h4>
                  <p className="text-slate-600 text-sm">Shipping, returns, product info, order status</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Documentation Sites</h4>
                  <p className="text-slate-600 text-sm">Turn docs into conversational Q&A instantly</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Service Businesses</h4>
                  <p className="text-slate-600 text-sm">Hours, pricing, booking, common questions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Loved by Thousands of Businesses
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              See what our customers have to say about transforming their support with AI
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl shadow-lg border border-slate-200">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-700 mb-6 italic">
                "We reduced our support ticket volume by 60% in the first month. The AI handles repetitive questions perfectly, letting our team focus on complex issues."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  SM
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Sarah Mitchell</div>
                  <div className="text-sm text-slate-500">Head of Support, TechCorp</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl shadow-lg border border-slate-200">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-700 mb-6 italic">
                "The ROI was incredible. We're saving over $100K annually while providing better 24/7 support. Setup took less than an hour!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  JD
                </div>
                <div>
                  <div className="font-semibold text-slate-900">James Davidson</div>
                  <div className="text-sm text-slate-500">CEO, GrowthHub</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl shadow-lg border border-slate-200">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-700 mb-6 italic">
                "Customer satisfaction improved dramatically. Our CSAT scores jumped from 3.8 to 4.7 stars. The AI provides instant, accurate answers."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  LP
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Lisa Park</div>
                  <div className="text-sm text-slate-500">VP Customer Success, InnovateCo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges Section */}
      <div className="py-16 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-slate-500 text-sm font-medium mb-8 uppercase tracking-wider">
            Enterprise-Grade Security & Compliance
          </p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center">
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-slate-200">
              <svg className="w-12 h-12 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-xs font-semibold text-slate-600">SOC 2</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-slate-200">
              <svg className="w-12 h-12 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-xs font-semibold text-slate-600">GDPR</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-slate-200">
              <svg className="w-12 h-12 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-xs font-semibold text-slate-600">Stripe</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-slate-200">
              <svg className="w-12 h-12 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-xs font-semibold text-slate-600">PayPal</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-slate-200">
              <svg className="w-12 h-12 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-xs font-semibold text-slate-600">SSL</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-slate-200">
              <svg className="w-12 h-12 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-xs font-semibold text-slate-600">99.9% SLA</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-slate-900 to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Support?
          </h2>
          <p className="text-xl text-slate-300 mb-12">
            Join 10,000+ businesses reducing support workload with AI-powered FAQs.
            <span className="block mt-2 text-blue-300 font-semibold">Start your 14-day free trial today. No credit card required.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-slate-900 bg-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <span className="relative z-10">Start Free Trial</span>
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-transparent border-2 border-white rounded-lg shadow-sm hover:bg-white hover:text-slate-900 transition-all duration-200"
            >
              Contact Sales
            </Link>
          </div>
          <p className="mt-8 text-sm text-slate-400">
            💳 No credit card required • ✨ 14-day free trial • 🔒 Cancel anytime
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;