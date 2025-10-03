import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const WidgetEmbed: React.FC = () => {
  const [faqCount, setFaqCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFAQCount();
  }, []);

  const loadFAQCount = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/public/faq');
      if (response.data.success) {
        setFaqCount(response.data.faqs.length);
      }
    } catch (err: any) {
      setError('Failed to load FAQ count');
    } finally {
      setLoading(false);
    }
  };

  const embedCode = `<iframe 
  src="http://localhost:3001/widget" 
  width="400" 
  height="600" 
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
  title="FAQ Chat Widget">
</iframe>`;

  const copyToClipboard = async () => {
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
      alert('Embed code copied to clipboard!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Embed Chat Widget</h2>
        
        {/* FAQ Count */}
        <div className="mb-6 p-4 bg-blue-50 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">ℹ</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                FAQ Database Status
              </h3>
              <div className="mt-1 text-sm text-blue-700">
                {loading ? (
                  'Loading...'
                ) : error ? (
                  <span className="text-red-600">{error}</span>
                ) : (
                  `${faqCount} FAQs available for the chat widget`
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Widget Preview */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Widget Preview</h3>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
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

        {/* Embed Code */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Embed Code</h3>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
            <pre className="text-sm">
              <code>{embedCode}</code>
            </pre>
          </div>
          <button
            onClick={copyToClipboard}
            className="mt-3 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Copy Embed Code
          </button>
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">How to Use</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                1
              </span>
              <p>Copy the embed code above</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                2
              </span>
              <p>Paste it into your website's HTML where you want the chat widget to appear</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                3
              </span>
              <p>Customize the width and height attributes as needed for your layout</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                4
              </span>
              <p>Make sure your server is running (localhost:3001) for the widget to work</p>
            </div>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-medium mb-3">API Endpoints</h3>
          <div className="space-y-2 text-sm">
            <div>
              <code className="bg-white px-2 py-1 rounded text-blue-600">GET /api/public/faq</code>
              <span className="ml-2 text-gray-600">- Get all FAQs</span>
            </div>
            <div>
              <code className="bg-white px-2 py-1 rounded text-blue-600">POST /api/public/chat</code>
              <span className="ml-2 text-gray-600">- Chat with FAQ bot</span>
            </div>
            <div>
              <code className="bg-white px-2 py-1 rounded text-blue-600">GET /widget</code>
              <span className="ml-2 text-gray-600">- Chat widget interface</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
