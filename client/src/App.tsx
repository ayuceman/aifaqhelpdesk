import React, { useState } from 'react';
import { UploadPanel } from './components/UploadPanel';
import { GeneratorPanel } from './components/GeneratorPanel';
import { FAQEditor } from './components/FAQEditor';
import { EmbedSnippet } from './components/EmbedSnippet';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';

type Step = 'upload' | 'generate' | 'review' | 'embed';

interface FAQ {
  id?: string;
  question: string;
  answer: string;
}

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [extractedContent, setExtractedContent] = useState('');
  const [generatedFAQs, setGeneratedFAQs] = useState<FAQ[]>([]);
  const { toasts, removeToast, success, error, info } = useToast();

  const steps: { id: Step; label: string; number: number }[] = [
    { id: 'upload', label: 'Add Sources', number: 1 },
    { id: 'generate', label: 'Generate', number: 2 },
    { id: 'review', label: 'Review & Publish', number: 3 },
    { id: 'embed', label: 'Embed', number: 4 },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleContentExtracted = (content: string) => {
    setExtractedContent(content);
    success('Content extracted successfully!');
    setCurrentStep('generate');
  };

  const handleFAQsGenerated = (faqs: FAQ[]) => {
    setGeneratedFAQs(faqs);
    success(`Generated ${faqs.length} FAQs successfully!`);
    setCurrentStep('review');
  };

  const handleFAQsPublished = () => {
    success('FAQs published successfully!');
    setCurrentStep('embed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI FAQ Generator</h1>
              <p className="mt-1 text-sm text-gray-500">Create intelligent FAQs with local AI</p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Ollama Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, index) => (
              <li key={step.id} className="relative flex-1">
                {index !== 0 && (
                  <div className="absolute left-0 top-5 -ml-px w-full h-0.5 bg-gray-200">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        index <= currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                )}
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`relative flex flex-col items-center group ${
                    index <= currentStepIndex ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                  disabled={index > currentStepIndex}
                >
                  <span
                    className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all ${
                      currentStep === step.id
                        ? 'border-blue-600 bg-blue-600 text-white shadow-lg scale-110'
                        : index < currentStepIndex
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 bg-white text-gray-500'
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-sm font-semibold">{step.number}</span>
                    )}
                  </span>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      currentStep === step.id ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {currentStep === 'upload' && (
            <UploadPanel onContentExtracted={handleContentExtracted} toast={{ success, error, info }} />
          )}
          
          {currentStep === 'generate' && (
            <GeneratorPanel 
              content={extractedContent}
              onFAQsGenerated={handleFAQsGenerated}
              toast={{ success, error, info }}
            />
          )}
          
          {currentStep === 'review' && (
            <FAQEditor 
              initialFAQs={generatedFAQs}
              onPublish={handleFAQsPublished}
              toast={{ success, error, info }}
            />
          )}
          
          {currentStep === 'embed' && (
            <EmbedSnippet toast={{ success, error, info }} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;