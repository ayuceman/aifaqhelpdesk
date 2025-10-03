import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface FAQ {
  id?: string;
  question: string;
  answer: string;
}

interface FAQEditorProps {
  initialFAQs: FAQ[];
  onPublish: () => void;
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
  };
}

export const FAQEditor: React.FC<FAQEditorProps> = ({ initialFAQs, onPublish, toast }) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (initialFAQs && initialFAQs.length > 0) {
      setFaqs(initialFAQs);
    } else {
      loadFAQs();
    }
  }, [initialFAQs]);

  const loadFAQs = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/faq');
      if (response.data.success) {
        setFaqs(response.data.faqs);
      }
    } catch (err) {
      toast.error('Failed to load existing FAQs');
    }
  };

  const validateFAQ = (question: string, answer: string): string | null => {
    if (!question.trim()) return 'Question cannot be empty';
    if (!answer.trim()) return 'Answer cannot be empty';
    if (answer.length > 1200) return 'Answer must be 1200 characters or less';
    return null;
  };

  const handleEdit = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    setFaqs(updated);
  };

  const handleDelete = (index: number) => {
    setFaqs(prev => prev.filter((_, i) => i !== index));
    toast.info('FAQ removed');
  };

  const handleAddNew = () => {
    setFaqs(prev => [...prev, { question: '', answer: '' }]);
    setTimeout(() => {
      const element = document.getElementById(`faq-${faqs.length}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handlePublish = async () => {
    // Validate all FAQs
    for (let i = 0; i < faqs.length; i++) {
      const error = validateFAQ(faqs[i].question, faqs[i].answer);
      if (error) {
        toast.error(`FAQ ${i + 1}: ${error}`);
        return;
      }
    }

    if (faqs.length === 0) {
      toast.error('Add at least one FAQ before publishing');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/faq/bulk', { 
        faqs,
        project: 'default' // Use default project for now
      });
      
      if (response.data.success) {
        toast.success(`Published ${faqs.length} FAQs successfully!`);
        onPublish();
      }
    } catch (err: any) {
      console.error('Publish error:', err);
      toast.error(err.response?.data?.error || 'Failed to publish FAQs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Edit FAQs</h2>
          <p className="text-sm text-gray-600">Edit questions and answers before publishing</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            + Add FAQ
          </button>
          <button
            onClick={handlePublish}
            disabled={loading || faqs.length === 0}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? 'Publishing...' : `Publish ${faqs.length} FAQ${faqs.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>

      {faqs.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 mb-4 text-gray-300">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs Yet</h3>
          <p className="text-sm text-gray-500 mb-4">Add your first FAQ to get started</p>
          <button
            onClick={handleAddNew}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Add FAQ
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-gray-700">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Question</div>
            <div className="col-span-5">Answer</div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* FAQ Rows */}
          {faqs.map((faq, index) => {
            const error = validateFAQ(faq.question, faq.answer);
            const answerLength = faq.answer.length;
            
            return (
              <div
                key={index}
                id={`faq-${index}`}
                className={`grid grid-cols-12 gap-4 p-4 bg-white rounded-lg border-2 transition-all ${
                  error ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="col-span-1 flex items-start pt-2">
                  <span className="text-sm font-medium text-gray-500">{index + 1}</span>
                </div>
                
                <div className="col-span-5">
                  <textarea
                    value={faq.question}
                    onChange={(e) => handleEdit(index, 'question', e.target.value)}
                    placeholder="Enter question..."
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      !faq.question.trim() && faq.answer.trim() ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                
                <div className="col-span-5">
                  <textarea
                    value={faq.answer}
                    onChange={(e) => handleEdit(index, 'answer', e.target.value)}
                    placeholder="Enter answer..."
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      !faq.answer.trim() && faq.question.trim() ? 'border-red-300' : answerLength > 1200 ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <div className="mt-1 flex justify-between items-center">
                    <span className={`text-xs ${answerLength > 1200 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                      {answerLength} / 1200 characters
                    </span>
                    {error && <span className="text-xs text-red-600">{error}</span>}
                  </div>
                </div>
                
                <div className="col-span-1 flex items-start pt-2">
                  <button
                    onClick={() => handleDelete(index)}
                    className="text-red-600 hover:text-red-800 text-sm p-1 rounded hover:bg-red-50 transition-colors"
                    title="Delete FAQ"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Card */}
      {faqs.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total FAQs</p>
              <p className="text-2xl font-bold text-gray-900">{faqs.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Valid FAQs</p>
              <p className="text-2xl font-bold text-green-600">
                {faqs.filter(f => !validateFAQ(f.question, f.answer)).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Issues</p>
              <p className="text-2xl font-bold text-red-600">
                {faqs.filter(f => validateFAQ(f.question, f.answer)).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};