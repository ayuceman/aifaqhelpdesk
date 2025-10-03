import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const DemoPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);

  useEffect(() => {
    loadDemoFAQs();
  }, []);

  const loadDemoFAQs = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/public/faq?project=demo');
      if (response.data.success) {
        setFaqs(response.data.faqs);
      }
    } catch (error) {
      console.error('Failed to load demo FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const widgetUrl = `${window.location.origin.replace(/:\d+/, ':3001')}/widget?project=demo`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              AI FAQ Generator - Demo
            </h1>
            <a 
              href="/"
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try It Yourself
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Introduction */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Live Demo: AI-Powered FAQ Assistant
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              This demo showcases how our AI FAQ Generator works. Try asking questions in the chat widget below,
              or browse the pre-loaded FAQs.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* FAQ List */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-3xl">📚</span>
                Demo FAQs ({faqs.length})
              </h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading FAQs...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <button
                      key={faq.id}
                      onClick={() => setSelectedFaq(faq)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedFaq?.id === faq.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900 mb-1">{faq.question}</h4>
                      {selectedFaq?.id === faq.id && (
                        <p className="text-sm text-gray-600 mt-2 pt-2 border-t border-gray-200">
                          {faq.answer}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Live Chat Widget */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-3xl">💬</span>
                Try the Chat Widget
              </h3>
              <p className="text-gray-600 mb-6">
                Ask any question related to the FAQs. The AI will find the best answer using
                smart keyword matching and contextual understanding.
              </p>
              
              <div className="border-4 border-gray-200 rounded-xl overflow-hidden" style={{ height: '600px' }}>
                <iframe
                  src={widgetUrl}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  title="FAQ Chat Widget Demo"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Embed Instructions */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-xl p-8 text-white mb-12">
            <h3 className="text-3xl font-bold mb-4">Want This On Your Website?</h3>
            <p className="text-lg mb-6 opacity-90">
              Copy the embed code below and paste it anywhere on your website, Notion page, or documentation.
            </p>
            
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
              <pre className="text-green-400">{`<iframe 
  src="${widgetUrl}"
  width="400" 
  height="600" 
  frameborder="0"
  style="border: none; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
></iframe>`}</pre>
            </div>
            
            <button
              onClick={() => {
                const embedCode = `<iframe src="${widgetUrl}" width="400" height="600" frameborder="0" style="border: none; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></iframe>`;
                navigator.clipboard.writeText(embedCode);
                alert('Embed code copied to clipboard!');
              }}
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              📋 Copy Embed Code
            </button>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              How It Works
            </h3>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  📄
                </div>
                <h4 className="font-bold text-gray-900 mb-2">1. Upload Content</h4>
                <p className="text-sm text-gray-600">
                  Upload PDFs, DOCX, TXT files or provide a website URL
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  🤖
                </div>
                <h4 className="font-bold text-gray-900 mb-2">2. AI Generates FAQs</h4>
                <p className="text-sm text-gray-600">
                  Our AI analyzes content and creates relevant Q&A pairs
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  ✏️
                </div>
                <h4 className="font-bold text-gray-900 mb-2">3. Review & Edit</h4>
                <p className="text-sm text-gray-600">
                  Fine-tune questions and answers to match your needs
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  🚀
                </div>
                <h4 className="font-bold text-gray-900 mb-2">4. Publish & Embed</h4>
                <p className="text-sm text-gray-600">
                  Get embed code and add the widget to your website
                </p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-4xl mb-3">⚡</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Lightning Fast</h4>
              <p className="text-gray-600 text-sm">
                From upload to live widget in under 5 minutes. No coding required.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Smart Matching</h4>
              <p className="text-gray-600 text-sm">
                AI-powered keyword and semantic matching for accurate answers.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-4xl mb-3">🔒</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Privacy First</h4>
              <p className="text-gray-600 text-sm">
                Your data stays secure. Local storage by default.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-white rounded-xl shadow-xl p-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Create Your Own FAQ?
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Start generating intelligent FAQs for your business in minutes.
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="/"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Get Started Free
              </a>
              <a
                href="/contact"
                className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg border-2 border-gray-300 hover:border-blue-600 transition-all"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 AI FAQ Generator. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</a>
            <a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DemoPage;

