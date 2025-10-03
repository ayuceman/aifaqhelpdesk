import React, { useState } from 'react';
import axios from 'axios';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQGeneratorProps {
  onFAQsGenerated: (faqs: FAQ[]) => void;
  onEditFAQs: () => void;
}

export const FAQGenerator: React.FC<FAQGeneratorProps> = ({ onFAQsGenerated, onEditFAQs }) => {
  const [tone, setTone] = useState<'formal' | 'concise' | 'friendly'>('friendly');
  const [maxQuestions, setMaxQuestions] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedFAQs, setGeneratedFAQs] = useState<FAQ[]>([]);

  const handleGenerate = async () => {
    const content = localStorage.getItem('extractedContent');
    if (!content) {
      setError('No content found. Please upload content first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3001/api/upload/generate-faq', {
        content,
        tone,
        maxQuestions
      });

      if (response.data.success) {
        setGeneratedFAQs(response.data.faqs);
        onFAQsGenerated(response.data.faqs);
      } else {
        setError('Failed to generate FAQs');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFAQs = async () => {
    if (generatedFAQs.length === 0) {
      setError('No FAQs to save');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3001/api/faq/bulk', {
        faqs: generatedFAQs
      });

      if (response.data.success) {
        alert('FAQs saved successfully!');
        onEditFAQs();
      } else {
        setError('Failed to save FAQs');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Generate FAQ</h2>
        
        {/* Generation Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as 'formal' | 'concise' | 'friendly')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="formal">Formal</option>
              <option value="concise">Concise</option>
              <option value="friendly">Friendly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Questions
            </label>
            <input
              type="number"
              value={maxQuestions}
              onChange={(e) => setMaxQuestions(parseInt(e.target.value) || 15)}
              min="1"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {loading ? 'Generating FAQs...' : 'Generate FAQs'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Generated FAQs */}
        {generatedFAQs.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Generated FAQs ({generatedFAQs.length})</h3>
              <button
                onClick={handleSaveFAQs}
                disabled={loading}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save All FAQs'}
              </button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {generatedFAQs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-500">Q:</span>
                    <p className="text-gray-900">{faq.question}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">A:</span>
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
