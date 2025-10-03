import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLoadDemo: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLoadDemo }) => {
  const embedCode = `<iframe 
  src="http://localhost:3001/widget?project=demo" 
  width="400" 
  height="600" 
  frameborder="0"
  style="border: none; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
></iframe>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    alert('Embed code copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI FAQ Generator & Helpdesk
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Transform your documents into intelligent FAQs in minutes. Upload content, 
            generate questions & answers with AI, and embed a smart chat widget anywhere.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105"
            >
              Get Started
            </button>
            <a
              href="/demo"
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-50 transition-all border-2 border-blue-600 inline-flex items-center"
            >
              View Live Demo
            </a>
            <button
              onClick={onLoadDemo}
              className="px-8 py-4 bg-purple-600 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-700 transition-all"
            >
              Try It Now
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-24 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Content</h3>
              <p className="text-gray-600">
                Upload PDFs, DOCX, TXT files or provide a website URL to crawl.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate FAQs</h3>
              <p className="text-gray-600">
                AI analyzes your content and creates relevant Q&A pairs automatically.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xl mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Review & Edit</h3>
              <p className="text-gray-600">
                Edit, add, or remove questions. Fine-tune answers to match your voice.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xl mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Embed Widget</h3>
              <p className="text-gray-600">
                Copy the embed code and paste it anywhere. Your FAQ bot is live!
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-gray-600">
                Uses advanced language models (Ollama or OpenAI) for accurate Q&A generation.
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Customizable</h3>
              <p className="text-gray-600">
                Choose tone (formal, concise, friendly) and control how many questions to generate.
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast & Easy</h3>
              <p className="text-gray-600">
                From upload to live widget in under 5 minutes. No coding required.
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure</h3>
              <p className="text-gray-600">
                Your data stays local by default. Privacy-first architecture.
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Tenant</h3>
              <p className="text-gray-600">
                Supports multiple projects. Perfect for agencies and businesses.
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Chat</h3>
              <p className="text-gray-600">
                Widget uses keyword + AI matching for intelligent responses.
              </p>
            </div>
          </div>
        </div>

        {/* Embed Preview */}
        <div className="mt-24 max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Embed Code (Demo)
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Copy this code and paste it into any website to add the FAQ chat widget.
          </p>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto relative">
            <pre>{embedCode}</pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-sans"
            >
              Copy
            </button>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Build Your FAQ?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Start creating intelligent FAQs in minutes.
          </p>
          <button
            onClick={onGetStarted}
            className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 text-lg"
          >
            Get Started Now
          </button>
        </div>

        {/* Footer */}
        <div className="mt-24 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <div className="flex justify-center gap-6 mb-4">
            <a href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            <a href="/contact" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>
          <p>&copy; 2025 AI FAQ Generator. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

