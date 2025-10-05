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
import PricingPage from './components/PricingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Dashboard from './components/Dashboard';
import ProjectDetails from './components/ProjectDetails';
import TrialStatus from './components/TrialStatus';
import UpgradePage from './components/UpgradePage';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentCancel from './components/PaymentCancel';

type Step = 'upload' | 'generate' | 'review' | 'embed';
type Page = 'landing' | 'app' | 'privacy' | 'terms' | 'contact' | 'demo' | 'pricing' | 'login' | 'signup' | 'dashboard' | 'project-details' | 'upgrade' | 'payment-success' | 'payment-cancel';

interface FAQ {
  id?: string;
  question: string;
  answer: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  trialStartDate?: string;
  trialEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [extractedContent, setExtractedContent] = useState('');
  const [generatedFAQs, setGeneratedFAQs] = useState<FAQ[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
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

  const handleNavigateToPricing = () => {
    setCurrentPage('pricing');
  };

  const handleNavigateToLogin = () => {
    setCurrentPage('login');
  };

  const handleNavigateToSignup = () => {
    setCurrentPage('signup');
  };

  const handleNavigateToUpgrade = () => {
    setCurrentPage('upgrade');
  };

  const handleUpgrade = async (planId: string, interval: 'month' | 'year') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3001/api/payment/create-payment', {
        planId,
        interval
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Redirect to PayPal
        window.location.href = response.data.approvalUrl;
      }
    } catch (error: any) {
      console.error('Upgrade error:', error);
      error('Failed to start upgrade process. Please try again.');
    }
  };

  const handlePaymentSuccess = () => {
    setCurrentPage('payment-success');
  };

  const handlePaymentCancel = () => {
    setCurrentPage('payment-cancel');
  };

  const handleLogin = (userData: User, token: string) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleSignup = (userData: User, token: string) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentProject(null);
    setCurrentPage('landing');
  };

  const handleNavigateToProject = (projectId: string) => {
    setCurrentProject(projectId);
    setCurrentPage('app');
    setCurrentStep('upload');
  };

  const handleViewProjectDetails = (project: any) => {
    setSelectedProject(project);
    setCurrentPage('project-details');
  };

  const handleBackToDashboard = () => {
    setSelectedProject(null);
    setCurrentPage('dashboard');
  };

  const handleProjectUpdated = (updatedProject: any) => {
    setSelectedProject(updatedProject);
  };

  // Check for existing user on app load
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setCurrentPage('dashboard');
      } catch (error) {
        // Invalid user data, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

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
        } else if (path === '/pricing') {
          setCurrentPage('pricing');
          window.history.pushState({}, '', '/pricing');
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
    return <DemoPage onNavigateToApp={handleGetStarted} />;
  }

  if (currentPage === 'pricing') {
    return <PricingPage onNavigateToApp={handleGetStarted} />;
  }

  if (currentPage === 'login') {
    return (
      <LoginPage
        onLogin={handleLogin}
        onNavigateToSignup={handleNavigateToSignup}
        onNavigateToHome={() => setCurrentPage('landing')}
      />
    );
  }

  if (currentPage === 'signup') {
    return (
      <SignupPage
        onSignup={handleSignup}
        onNavigateToLogin={handleNavigateToLogin}
        onNavigateToHome={() => setCurrentPage('landing')}
      />
    );
  }

      if (currentPage === 'dashboard') {
        if (!user) {
          setCurrentPage('landing');
          return null;
        }
        return (
          <Dashboard
            user={user}
            onLogout={handleLogout}
            onNavigateToProject={handleNavigateToProject}
            onViewProjectDetails={handleViewProjectDetails}
            onNavigateToHome={() => setCurrentPage('landing')}
            onNavigateToUpgrade={handleNavigateToUpgrade}
          />
        );
      }

      if (currentPage === 'project-details') {
        if (!user || !selectedProject) {
          setCurrentPage('dashboard');
          return null;
        }
        return (
          <ProjectDetails
            projectId={selectedProject.id}
            onBack={handleBackToDashboard}
            onEditProject={handleProjectUpdated}
          />
        );
      }

      if (currentPage === 'upgrade') {
        if (!user) {
          setCurrentPage('landing');
          return null;
        }
        return (
          <UpgradePage
            onBack={() => setCurrentPage('dashboard')}
            onUpgrade={handleUpgrade}
          />
        );
      }

      if (currentPage === 'payment-success') {
        return (
          <PaymentSuccess
            onBack={() => setCurrentPage('dashboard')}
          />
        );
      }

      if (currentPage === 'payment-cancel') {
        return (
          <PaymentCancel
            onBack={() => setCurrentPage('dashboard')}
            onRetry={() => setCurrentPage('upgrade')}
          />
        );
      }

  // Render landing page
  if (currentPage === 'landing') {
    return (
      <>
        <LandingPage 
          onGetStarted={handleGetStarted} 
          onLoadDemo={handleLoadDemo}
          onNavigateToLogin={handleNavigateToLogin}
          onNavigateToSignup={handleNavigateToSignup}
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  // Render main app
  return (
    <div className="min-h-screen bg-slate-50">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <button 
                onClick={handleBackToHome}
                className="text-xl font-bold text-slate-900 hover:text-slate-700 transition-colors"
              >
                FAQ Generator
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToHome}
                className="btn-ghost text-sm"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Step Progress */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                      index <= currentStepIndex
                        ? 'bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-lg'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`mt-3 text-sm font-semibold transition-colors ${
                      index <= currentStepIndex ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-6 rounded-full transition-colors duration-300 ${
                      index < currentStepIndex ? 'bg-slate-900' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
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
                  toast={{ success, error, info }}
                />
              )}
              {currentStep === 'review' && (
                <FAQEditor
                  initialFAQs={generatedFAQs}
                  onPublish={handleFAQsPublished}
                  projectId={currentProject}
                  toast={{ success, error, info }}
                />
              )}
              {currentStep === 'embed' && (
                <EmbedSnippet toast={{ success, error, info }} />
              )}
            </div>
            <div className="lg:col-span-1">
              <TrialStatus 
                project={currentProject || "default"} 
                onUpgrade={() => {
                  // TODO: Implement upgrade flow
                  info('Upgrade functionality coming soon!');
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
