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
        project: 'default'
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Review & Publish FAQs</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Edit, refine, and customize your generated FAQs before publishing them live
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleAddNew}
            className="btn-secondary flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New FAQ</span>
          </button>
          <div className="text-sm text-slate-500">
            {faqs.length} FAQ{faqs.length !== 1 ? 's' : ''} ready
          </div>
        </div>
        
        <button
          onClick={handlePublish}
          disabled={loading || faqs.length === 0}
          className="btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Publishing...' : 'Publish & Build Embeddings'}
        </button>
      </div>

      {/* FAQ List */}
      {faqs.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No FAQs Generated Yet</h3>
          <p className="text-slate-600 mb-6">
            Please go back to the 'Generate' step to create your FAQs first.
          </p>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            Go Back to Generate
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={faq.id || `new-${index}`} id={`faq-${index}`} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm font-semibold text-slate-600">
                    {index + 1}
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">FAQ #{index + 1}</h4>
                </div>
                <button
                  onClick={() => handleDelete(index)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Question
                  </label>
                  <textarea
                    value={faq.question}
                    onChange={(e) => handleEdit(index, 'question', e.target.value)}
                    className="input-field min-h-[100px] resize-none"
                    placeholder="Enter your question here..."
                    rows={3}
                  />
                  <div className="text-xs text-slate-500 mt-1">
                    {faq.question.length} characters
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Answer
                  </label>
                  <textarea
                    value={faq.answer}
                    onChange={(e) => handleEdit(index, 'answer', e.target.value)}
                    className="input-field min-h-[100px] resize-none"
                    placeholder="Enter your answer here..."
                    rows={3}
                  />
                  <div className="text-xs text-slate-500 mt-1">
                    {faq.answer.length} characters
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {faqs.length > 0 && (
        <div className="card bg-slate-50 border-slate-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Ready to Publish</h3>
              <p className="text-slate-600">
                {faqs.length} FAQ{faqs.length !== 1 ? 's' : ''} will be published and made available for your chat widget
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">{faqs.length}</div>
              <div className="text-sm text-slate-500">Total FAQs</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};