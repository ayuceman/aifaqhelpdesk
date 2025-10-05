import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface DemoPageProps {
  onNavigateToApp?: () => void;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const DemoPage: React.FC<DemoPageProps> = ({ onNavigateToApp }) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadDemoFAQs();
  }, []);

  const loadDemoFAQs = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/public/faq?project=demo');
      if (response.data.success) {
        setFaqs(response.data.faqs);
      } else {
        setError(response.data.error || 'Failed to load demo FAQs');
      }
    } catch (error) {
      console.error('Failed to load demo FAQs:', error);
      setError('Failed to connect to the server or load demo FAQs.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const embedCode = `<iframe 
  src="http://localhost:3001/widget?project=demo" 
  width="400" 
  height="600" 
  frameborder="0"
  style="border: none; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
  title="AI FAQ Chat Widget Demo">
</iframe>`;

  const handleCopyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      alert('Embed code copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = embedCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Embed code copied!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="relative z-10 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold text-slate-900">FAQ Generator</span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="/" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Home</a>
              <a href="/contact" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Contact</a>
              <a href="/privacy" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Privacy</a>
              <a href="/terms" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Terms</a>
              <button
                onClick={onNavigateToApp}
                className="btn-primary"
              >
                Try It Yourself
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
              Live Demo - Interactive Experience
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 mb-8 leading-tight animate-fade-in">
              Experience the Power of
              <span className="block text-gradient-primary">AI FAQ Generation</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in">
              Interact with our AI-powered chat widget, pre-loaded with intelligent FAQs. 
              See how your customers will experience instant, accurate answers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-scale-in">
              <button
                onClick={onNavigateToApp}
                className="btn-primary text-lg px-8 py-4"
              >
                Create Your Own
              </button>
              <button
                onClick={handleCopyEmbedCode}
                className="btn-secondary text-lg px-8 py-4"
              >
                Copy Embed Code
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* FAQ List */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Demo FAQs</h2>
              {loading ? (
                <div className="card p-8 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <p className="text-slate-600">Loading demo FAQs...</p>
                </div>
              ) : error ? (
                <div className="card p-8 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-red-600">{error}</p>
                </div>
              ) : faqs.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-slate-600">No demo FAQs available.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="card p-6 hover:shadow-lg transition-shadow">
                      <button
                        className="flex justify-between items-start w-full text-left"
                        onClick={() => toggleExpand(faq.id)}
                      >
                        <h3 className="text-lg font-semibold text-slate-900 pr-4">{faq.question}</h3>
                        <span className="text-slate-400 text-xl flex-shrink-0">
                          {expandedId === faq.id ? '−' : '+'}
                        </span>
                      </button>
                      {expandedId === faq.id && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Widget */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Live Chat Widget</h2>
              <div className="card p-6">
                <div className="bg-slate-50 rounded-xl p-6 flex flex-col items-center">
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 text-center">AI Chat Assistant</h3>
                    <p className="text-sm text-slate-600 text-center">Ask me anything about our platform!</p>
                  </div>
                  
                  <div className="w-full max-w-sm border border-slate-200 rounded-xl overflow-hidden shadow-lg">
                    <iframe
                      src="http://localhost:3001/widget?project=demo"
                      width="400"
                      height="600"
                      frameBorder="0"
                      title="AI FAQ Chat Widget Demo"
                      className="w-full"
                    />
                  </div>
                  
                  <button
                    onClick={handleCopyEmbedCode}
                    className="mt-6 btn-secondary flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy Embed Code</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Four simple steps to deploy intelligent FAQ systems across your organization
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
                Q&A pairs with customizable tone and style.
              </p>
            </div>

            <div className="card p-8 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Review & Edit</h3>
              <p className="text-slate-600 leading-relaxed">
                Fine-tune generated content with our intuitive editor. Add, edit, or 
                remove questions to match your brand voice.
              </p>
            </div>

            <div className="card p-8 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 mx-auto">
                4
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Deploy Widget</h3>
              <p className="text-slate-600 leading-relaxed">
                Deploy intelligent chat widgets across your websites, apps, and 
                platforms with simple embed codes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Choose AI FAQ Generator?</h2>
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
                Generate hundreds of FAQs in minutes with our optimized AI models. 
                Built for speed and efficiency.
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
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Build Your Own?
          </h2>
          <p className="text-xl text-slate-300 mb-12">
            Start generating intelligent FAQs for your business today. 
            No credit card required for your first project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onNavigateToApp}
              className="btn-primary bg-white text-slate-900 hover:bg-slate-100 text-lg px-8 py-4"
            >
              Start Building Now
            </button>
            <a
              href="/contact"
              className="btn-secondary border-white text-white hover:bg-white hover:text-slate-900 text-lg px-8 py-4"
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
                <span className="text-xl font-bold text-slate-900">FAQ Generator</span>
              </div>
              <p className="text-slate-600 text-sm">
                Enterprise-grade AI FAQ generation platform for modern organizations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="/demo" className="hover:text-slate-900 transition-colors">Demo</a></li>
                <li><a href="/" className="hover:text-slate-900 transition-colors">Get Started</a></li>
                <li><a href="/contact" className="hover:text-slate-900 transition-colors">Contact</a></li>
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
                <li><a href="/" className="hover:text-slate-900 transition-colors">Get Started</a></li>
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

export default DemoPage;