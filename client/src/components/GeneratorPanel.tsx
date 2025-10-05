import React, { useState } from 'react';
import axios from 'axios';

interface FAQ {
  question: string;
  answer: string;
}

interface GeneratorPanelProps {
  content: string;
  onFAQsGenerated: (faqs: FAQ[]) => void;
}

export const GeneratorPanel: React.FC<GeneratorPanelProps> = ({ content, onFAQsGenerated }) => {
  const [tone, setTone] = useState<'formal' | 'concise' | 'friendly'>('friendly');
  const [maxQuestions, setMaxQuestions] = useState(10);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: 'Analyzing Content', description: 'Processing your content for optimal FAQ generation' },
    { label: 'Connecting to AI', description: 'Establishing connection with Ollama AI model' },
    { label: 'Generating Questions', description: 'Creating relevant questions based on your content' },
    { label: 'Crafting Answers', description: 'Writing comprehensive answers for each question' },
    { label: 'Finalizing FAQs', description: 'Reviewing and optimizing the generated content' }
  ];

  const handleGenerate = async () => {
    if (!content || content.length < 100) {
      alert('Content is too short. Please provide at least 100 characters.');
      return;
    }

    setLoading(true);
    setCurrentStep(0);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          setProgress(steps[prev + 1].description);
          return prev + 1;
        }
        return prev;
      });
    }, 2000);

    try {
      const response = await axios.post('http://localhost:3001/api/upload/generate-faq', {
        content,
        tone,
        maxQuestions
      }, {
        timeout: 180000 // 3 minutes timeout
      });

      clearInterval(progressInterval);
      
      if (response.data.success && response.data.faqs) {
        onFAQsGenerated(response.data.faqs);
      } else {
        throw new Error(response.data.error || 'Failed to generate FAQs');
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      console.error('FAQ generation error:', error);
      alert(error.response?.data?.error || 'Failed to generate FAQs. Please try again.');
    } finally {
      setLoading(false);
      setCurrentStep(0);
      setProgress('');
    }
  };

  const wordCount = content.split(/\s+/).length;
  const estimatedTime = Math.max(30, Math.ceil(wordCount / 100) * 10);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Generate FAQs</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Configure your FAQ generation settings and let AI create intelligent Q&A pairs from your content
        </p>
      </div>

      {/* Content Preview */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Content Preview</h3>
        <div className="bg-slate-50 rounded-lg p-4 max-h-40 overflow-y-auto">
          <p className="text-sm text-slate-600 leading-relaxed">
            {content.substring(0, 500)}{content.length > 500 ? '...' : ''}
          </p>
        </div>
        <div className="flex justify-between items-center mt-4 text-sm text-slate-500">
          <span>{wordCount.toLocaleString()} words</span>
          <span>{content.length.toLocaleString()} characters</span>
        </div>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tone Selection */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Tone & Style</h3>
          <div className="space-y-3">
            {[
              { value: 'formal', label: 'Formal', description: 'Professional and authoritative tone' },
              { value: 'concise', label: 'Concise', description: 'Brief and to-the-point answers' },
              { value: 'friendly', label: 'Friendly', description: 'Warm and approachable tone' }
            ].map((option) => (
              <label key={option.value} className="flex items-start p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="radio"
                  name="tone"
                  value={option.value}
                  checked={tone === option.value}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="text-slate-600 focus:ring-slate-500 mr-3 mt-1"
                />
                <div>
                  <div className="font-medium text-slate-900">{option.label}</div>
                  <div className="text-sm text-slate-500">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Generation Settings</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Maximum Questions
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={maxQuestions}
                  onChange={(e) => setMaxQuestions(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-semibold text-slate-900 w-8">{maxQuestions}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Lower = Faster • Recommended: 8-12 for optimal performance
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-semibold text-blue-900">Performance Tips</h4>
                  <div className="text-sm text-blue-700 mt-1">
                    <p>• Using qwen2.5:3b model for faster generation</p>
                    <p>• Estimated time: {estimatedTime}s for {wordCount.toLocaleString()} words</p>
                    <p>• Tip: Try 5-10 questions first for faster results</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      {loading && (
        <div className="card p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {steps[currentStep]?.label || 'Processing...'}
            </h3>
            <p className="text-slate-600 mb-6">
              {progress || steps[currentStep]?.description || 'Please wait while we generate your FAQs...'}
            </p>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex justify-center space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      {!loading && (
        <div className="text-center">
          <button
            onClick={handleGenerate}
            disabled={!content || content.length < 100}
            className="btn-primary text-lg px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate {maxQuestions} FAQs
          </button>
          <p className="text-sm text-slate-500 mt-4">
            This may take 1-3 minutes depending on content length and model performance
          </p>
        </div>
      )}
    </div>
  );
};