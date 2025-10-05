import React, { useState } from 'react';

interface EmbedSnippetProps {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
  };
}

export const EmbedSnippet: React.FC<EmbedSnippetProps> = ({ toast }) => {
  const [copied, setCopied] = useState<'iframe' | 'script' | null>(null);

  const iframeCode = `<iframe 
  src="http://localhost:3001/widget?project=default" 
  width="400" 
  height="600" 
  frameborder="0"
  style="border: none; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
  title="AI FAQ Chat Widget">
</iframe>`;

  const scriptCode = `<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = 'http://localhost:3001/widget?project=default';
    iframe.width = '400';
    iframe.height = '600';
    iframe.frameBorder = '0';
    iframe.style.cssText = 'border: none; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);';
    iframe.title = 'AI FAQ Chat Widget';
    document.currentScript.parentNode.insertBefore(iframe, document.currentScript);
  })();
</script>`;

  const copyToClipboard = async (text: string, type: 'iframe' | 'script') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success('Embed code copied to clipboard!');
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(type);
      toast.success('Embed code copied!');
      setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Deploy Your Chat Widget</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Copy the embed code below and paste it into your website to deploy your AI-powered FAQ chat widget
        </p>
      </div>

      {/* Success Message */}
      <div className="card bg-green-50 border-green-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-green-900">Widget Ready for Deployment</h3>
            <p className="text-green-700 mt-1">
              Your FAQ chat widget is now live and ready to be embedded on your website.
            </p>
          </div>
        </div>
      </div>

      {/* Embed Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Iframe Embed */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Iframe Embed</h3>
            <button
              onClick={() => copyToClipboard(iframeCode, 'iframe')}
              className={`btn-secondary text-sm px-4 py-2 ${
                copied === 'iframe' ? 'bg-green-100 text-green-700 border-green-300' : ''
              }`}
            >
              {copied === 'iframe' ? '✓ Copied!' : 'Copy Code'}
            </button>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Simple iframe embed. Works with any website or CMS.
          </p>
          <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-slate-300 whitespace-pre-wrap">{iframeCode}</pre>
          </div>
        </div>

        {/* Script Embed */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Script Embed</h3>
            <button
              onClick={() => copyToClipboard(scriptCode, 'script')}
              className={`btn-secondary text-sm px-4 py-2 ${
                copied === 'script' ? 'bg-green-100 text-green-700 border-green-300' : ''
              }`}
            >
              {copied === 'script' ? '✓ Copied!' : 'Copy Code'}
            </button>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            JavaScript embed for dynamic loading and better performance.
          </p>
          <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-slate-300 whitespace-pre-wrap">{scriptCode}</pre>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Live Preview</h3>
        <p className="text-sm text-slate-600 mb-6">
          See how your chat widget will appear on your website
        </p>
        <div className="flex justify-center">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-lg">
            <iframe
              src="http://localhost:3001/widget?project=default"
              width="400"
              height="600"
              frameBorder="0"
              title="AI FAQ Chat Widget Preview"
            />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Deployment Instructions</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Copy the Embed Code</h4>
              <p className="text-slate-600 text-sm">Choose either iframe or script embed and copy the code to your clipboard.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Paste into Your Website</h4>
              <p className="text-slate-600 text-sm">Add the code to your HTML where you want the chat widget to appear.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Customize Appearance</h4>
              <p className="text-slate-600 text-sm">Adjust the width, height, and styling to match your website's design.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
              4
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Test & Go Live</h4>
              <p className="text-slate-600 text-sm">Test the widget on your website and publish when ready.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="card bg-slate-50 border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">What's Next?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">Monitor Performance</h4>
            <p className="text-sm text-slate-600">Track user interactions and FAQ effectiveness</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">Update Content</h4>
            <p className="text-sm text-slate-600">Add new FAQs and update existing ones as needed</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">Scale Up</h4>
            <p className="text-sm text-slate-600">Create multiple projects for different use cases</p>
          </div>
        </div>
      </div>
    </div>
  );
};
