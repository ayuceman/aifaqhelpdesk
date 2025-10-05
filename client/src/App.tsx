import React, { useState } from 'react';
import axios from 'axios';
import { UploadPanel } from './components/UploadPanel';
import { GeneratorPanel } from './components/GeneratorPanel';
import { FAQEditor } from './components/FAQEditor';
import { EmbedSnippet } from './components/EmbedSnippet';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';
import LandingPage from './components/LandingPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import ContactPage from './components/ContactPage';
import DemoPage from './components/DemoPage';

type Step = 'upload' | 'generate' | 'review' | 'embed';
type Page = 'landing' | 'app' | 'privacy' | 'terms' | 'contact' | 'demo';

interface FAQ {
  id?: string;
  question: string;
  answer: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
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

  const handleGetStarted = () => {
    setCurrentPage('app');
    setCurrentStep('upload');
  };

  const handleLoadDemo = async () => {
    try {
      info('Loading demo FAQs...');
      const response = await axios.get('http://localhost:3001/api/public/faq?project=demo');
      if (response.data.success && response.data.faqs.length > 0) {
        setGeneratedFAQs(response.data.faqs);
        success('Demo FAQs loaded! You can now review and edit them.');
        setCurrentPage('app');
        setCurrentStep('review');
      } else {
        error('No demo FAQs found. Please generate your own.');
      }
    } catch (err) {
      console.error('Load demo error:', err);
      error('Failed to load demo FAQs');
    }
  };

  const handleBackToHome = () => {
    setCurrentPage('landing');
  };

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

  // Handle navigation
  React.useEffect(() => {
    const handleNavigation = (e: PopStateEvent) => {
      e.preventDefault();
      const path = window.location.pathname;
      if (path === '/privacy') setCurrentPage('privacy');
      else if (path === '/terms') setCurrentPage('terms');
      else if (path === '/contact') setCurrentPage('contact');
      else if (path === '/demo') setCurrentPage('demo');
      else setCurrentPage('landing');
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  // Handle link clicks for legal pages
  React.useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement;
      if (target.tagName === 'A' && target.hostname === window.location.hostname) {
        e.preventDefault();
        const path = target.pathname;
        if (path === '/privacy') {
          setCurrentPage('privacy');
          window.history.pushState({}, '', '/privacy');
        } else if (path === '/terms') {
          setCurrentPage('terms');
          window.history.pushState({}, '', '/terms');
        } else if (path === '/contact') {
          setCurrentPage('contact');
          window.history.pushState({}, '', '/contact');
        } else if (path === '/demo') {
          setCurrentPage('demo');
          window.history.pushState({}, '', '/demo');
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  // Render pages
  if (currentPage === 'privacy') {
    return <PrivacyPolicy onBack={handleBackToHome} />;
  }

  if (currentPage === 'terms') {
    return <TermsOfService onBack={handleBackToHome} />;
  }

  if (currentPage === 'contact') {
    return <ContactPage onBack={handleBackToHome} />;
  }

  if (currentPage === 'demo') {
    return <DemoPage />;
  }

  // Render landing page
  if (currentPage === 'landing') {
    return (
      <>
        <LandingPage onGetStarted={handleGetStarted} onLoadDemo={handleLoadDemo} />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  // Render main app
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBackToHome}
              className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-80 transition-opacity"
            >
              AI FAQ Generator
            </button>
          </div>
          <button
            onClick={handleBackToHome}
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </header>

      {/* Step Progress */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      index <= currentStepIndex
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium transition-colors ${
                      index <= currentStepIndex ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded transition-colors ${
                      index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {currentStep === 'upload' && (
            <UploadPanel 
              onContentExtracted={handleContentExtracted} 
              toast={{ success, error, info }}
            />
          )}
          {currentStep === 'generate' && (
            <GeneratorPanel
              content={extractedContent}
              onFAQsGenerated={handleFAQsGenerated}
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
