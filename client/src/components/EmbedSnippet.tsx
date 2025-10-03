import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface EmbedSnippetProps {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
  };
}

export const EmbedSnippet: React.FC<EmbedSnippetProps> = ({ toast }) => {
  const [faqCount, setFaqCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'iframe' | 'script'>('iframe');

  useEffect(() => {
    loadFAQCount();
  }, []);

  const loadFAQCount = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/public/faq');
      if (response.data.success) {
        setFaqCount(response.data.faqs.length);
      }
    } catch (err) {
      toast.error('Failed to load FAQ count');
    } finally {
      setLoading(false);
    }
  };

  const iframeCode = `<iframe 
  src="http://localhost:3001/widget" 
  width="400" 
  height="600" 
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
  title="FAQ Chat Widget">
</iframe>`;

  const scriptCode = `<script>
  (function() {
    const widget = document.createElement('iframe');
    widget.src = 'http://localhost:3001/widget';
    widget.style.position = 'fixed';
    widget.style.bottom = '20px';
    widget.style.right = '20px';
    widget.style.width = '400px';
    widget.style.height = '600px';
    widget.style.border = 'none';
    widget.style.borderRadius = '12px';
    widget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    widget.style.zIndex = '9999';
    document.body.appendChild(widget);
  })();
</script>`;

  const handleCopy = async (code: string, type: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`${type} code copied to clipboard!`);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success(`${type} code copied!`);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Embed Chat Widget</h2>
        <p className="text-sm text-gray-600">Add the FAQ chat widget to your website</p>
      </div>

      {/* Status Card */}
      <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Widget Ready!</h3>
              <p className="text-sm text-gray-600">
                {loading ? 'Loading...' : `${faqCount} FAQs available for chat`}
              </p>
            </div>
          </div>
          <button
            onClick={loadFAQCount}
            className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors border border-gray-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Widget Preview */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
        <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
          <div className="flex justify-center">
            <iframe
              src="http://localhost:3001/widget"
              width="400"
              height="600"
              frameBorder="0"
              style={{ borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              title="FAQ Chat Widget Preview"
            />
          </div>
        </div>
      </div>

      {/* Code Snippets */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Embed Code</h3>
        
        {/* Tab Selector */}
        <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setActiveTab('iframe')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'iframe'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Iframe Embed
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'script'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Script Embed (Fixed Position)
          </button>
        </div>

        {/* Code Display */}
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
            <span className="text-sm font-medium text-gray-300">
              {activeTab === 'iframe' ? 'HTML' : 'JavaScript'}
            </span>
            <button
              onClick={() => handleCopy(activeTab === 'iframe' ? iframeCode : scriptCode, activeTab === 'iframe' ? 'Iframe' : 'Script')}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </button>
          </div>
          <div className="p-4 overflow-x-auto">
            <pre className="text-sm text-gray-100">
              <code>{activeTab === 'iframe' ? iframeCode : scriptCode}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Use</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <strong>Choose embed type:</strong> Use iframe for specific placement or script for fixed bottom-right corner
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <strong>Copy the code:</strong> Click the copy button to copy the embed code
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <strong>Paste into your site:</strong> Add the code to your HTML where you want the widget to appear
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              4
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <strong>For production:</strong> Replace <code className="bg-blue-100 px-1 rounded text-xs">localhost:3001</code> with your production domain
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* API Endpoints */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Widget API Endpoints</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <code className="text-xs bg-white px-2 py-1 rounded border border-gray-300 font-mono text-blue-600">
              GET /api/public/faq
            </code>
            <span className="text-sm text-gray-600">Retrieve all published FAQs</span>
          </div>
          <div className="flex items-start space-x-3">
            <code className="text-xs bg-white px-2 py-1 rounded border border-gray-300 font-mono text-blue-600">
              POST /api/public/chat
            </code>
            <span className="text-sm text-gray-600">Send question and get AI-powered answer</span>
          </div>
          <div className="flex items-start space-x-3">
            <code className="text-xs bg-white px-2 py-1 rounded border border-gray-300 font-mono text-blue-600">
              GET /widget
            </code>
            <span className="text-sm text-gray-600">Widget interface (embedded via iframe)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
