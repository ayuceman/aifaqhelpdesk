import React, { useState } from 'react';
import axios from 'axios';

interface FAQ {
  question: string;
  answer: string;
}

interface GeneratorPanelProps {
  content: string;
  onFAQsGenerated: (faqs: FAQ[]) => void;
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
  };
}

export const GeneratorPanel: React.FC<GeneratorPanelProps> = ({ content, onFAQsGenerated, toast }) => {
  const [tone, setTone] = useState<'formal' | 'concise' | 'friendly'>('friendly');
  const [maxQuestions, setMaxQuestions] = useState(10); // Default to 10 for better performance
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    '🔍 Analyzing content...',
    '🤖 Connecting to Ollama...',
    '⚡ Generating questions...',
    '✍️ Crafting answers...',
    '✨ Finalizing FAQs...'
  ];

  const handleGenerate = async () => {
    if (!content || content.length < 100) {
      toast.error('Content is too short. Please provide at least 100 characters.');
      return;
    }

    setLoading(true);
    setCurrentStep(0);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          setProgress(steps[prev + 1]);
          return prev + 1;
        }
        return prev;
      });
    }, 3000);

    try {
      setProgress(steps[0]);
      
      const response = await axios.post('http://localhost:3001/api/upload/generate-faq', {
        content,
        tone,
        maxQuestions
      }, {
        timeout: 180000 // 3 minute timeout for local models
      });

      clearInterval(progressInterval);

      if (response.data.success && response.data.faqs) {
        setProgress('✅ Complete!');
        setTimeout(() => {
          onFAQsGenerated(response.data.faqs);
        }, 500);
      } else {
        toast.error('No FAQs generated');
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setProgress('');
      
      if (err.code === 'ECONNABORTED') {
        toast.error('Request timeout - the model might be taking too long. Try with less questions or shorter content.');
      } else {
        toast.error(err.response?.data?.error || 'Failed to generate FAQs. Make sure Ollama is running with qwen3:8b model.');
      }
    } finally {
      setLoading(false);
      setTimeout(() => {
        setProgress('');
        setCurrentStep(0);
      }, 2000);
    }
  };

  const toneDescriptions = {
    formal: 'Professional language with complete sentences',
    concise: 'Direct and to-the-point responses',
    friendly: 'Warm and conversational tone',
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate FAQs</h2>
        <p className="text-sm text-gray-600">Configure how your FAQs should be generated</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Content Preview */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Content Ready</span>
            <span className="text-xs text-gray-500">{content.length.toLocaleString()} characters</span>
          </div>
          <div className="bg-white rounded border border-gray-200 p-3 max-h-24 overflow-y-auto">
            <p className="text-xs text-gray-600 line-clamp-3">{content.substring(0, 300)}...</p>
          </div>
        </div>

        {/* Tone Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tone
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['formal', 'concise', 'friendly'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                disabled={loading}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  tone === t
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 capitalize">{t}</span>
                  {tone === t && (
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="text-xs text-gray-500">{toneDescriptions[t]}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Max Questions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Questions
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={maxQuestions}
              onChange={(e) => setMaxQuestions(parseInt(e.target.value))}
              disabled={loading}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
            />
            <input
              type="number"
              min="1"
              max="50"
              value={maxQuestions}
              onChange={(e) => setMaxQuestions(Math.min(50, Math.max(1, parseInt(e.target.value) || 15)))}
              disabled={loading}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Generate between 5 and 50 questions
            {maxQuestions > 15 && (
              <span className="text-yellow-600 ml-1">(⚡ Lower = Faster)</span>
            )}
          </p>
        </div>

        {/* Progress Indicator */}
        {loading && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Generating FAQs...</span>
                <span className="text-xs text-gray-500">
                  {Math.min(Math.round((currentStep / (steps.length - 1)) * 100), 100)}%
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min((currentStep / (steps.length - 1)) * 100, 100)}%` }}
                />
              </div>

              {/* Current Step */}
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div 
                    key={index}
                    className={`flex items-center space-x-3 text-sm transition-all duration-300 ${
                      index < currentStep ? 'text-green-600' :
                      index === currentStep ? 'text-blue-600 font-medium' :
                      'text-gray-400'
                    }`}
                  >
                    {index < currentStep ? (
                      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : index === currentStep ? (
                      <svg className="animate-spin w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <div className="w-5 h-5 flex-shrink-0 rounded-full border-2 border-current"></div>
                    )}
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              {/* Estimated time */}
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-xs text-gray-600">
                  ⏱️ This may take 30-90 seconds depending on your system and content length.
                </p>
                <p className="text-xs text-green-600 mt-1">
                  ⚡ Using fast qwen2.5:3b model for quick generation
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        {!loading && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Generate FAQ</span>
          </button>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Using Ollama with <code className="bg-blue-100 px-1 rounded">qwen2.5:3b</code> model. 
                Optimized for faster generation (~2-3x faster than 8B models).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};