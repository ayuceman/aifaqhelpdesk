import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import CheckoutPage from './components/CheckoutPage';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentCancel from './components/PaymentCancel';
import SubscriptionManagement from './components/SubscriptionManagement';

type Step = 'upload' | 'generate' | 'review' | 'embed';

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
  trialPlanId?: string;
  createdAt: string;
  updatedAt: string;
}

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:3001/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data.user);
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Inner App Component with Navigation
function AppContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<any>(null);
  const [checkoutInterval, setCheckoutInterval] = useState<'month' | 'year'>('month');
  const { toasts, removeToast } = useToast();

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }

      // Check for checkout plan in localStorage
      const storedPlan = localStorage.getItem('checkoutPlan');
      const storedInterval = localStorage.getItem('checkoutInterval');
      if (storedPlan && storedInterval) {
        try {
          setCheckoutPlan(JSON.parse(storedPlan));
          setCheckoutInterval(storedInterval as 'month' | 'year');
        } catch (error) {
          console.error('Error parsing stored checkout data:', error);
        }
      }
    };
    checkAuth();
  }, []);

  const handleLogin = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleSignup = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('checkoutPlan');
    localStorage.removeItem('checkoutInterval');
    // Navigate to home page after logout
    navigate('/');
  };

  const handleUpgrade = async (plan: any, interval: 'month' | 'year') => {
    console.log('App handleUpgrade called with:', plan, interval);
    setCheckoutPlan(plan);
    setCheckoutInterval(interval);
    // Navigate to checkout page
    navigate('/checkout');
  };

  const handleStartTrial = async (plan: any) => {
    console.log('App handleStartTrial called with:', plan);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // User not logged in, redirect to signup
        navigate('/signup');
        return;
      }

      // Start trial for the selected plan
      const response = await fetch('http://localhost:3001/api/auth/start-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planId: plan.id })
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh user data to get updated trial info
        const userResponse = await fetch('http://localhost:3001/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user);
          localStorage.setItem('user', JSON.stringify(userData.user));
        }
        
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        console.error('Failed to start trial:', result.error);
        // Fallback to upgrade flow
        handleUpgrade(plan, 'month');
        navigate('/checkout');
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      // Fallback to upgrade flow
      handleUpgrade(plan, 'month');
      navigate('/checkout');
    }
  };

  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3001/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  return (
      <div className="min-h-screen bg-slate-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <LandingPage 
              onGetStarted={() => navigate('/app')}
              onLoadDemo={() => navigate('/demo')}
              onNavigateToLogin={() => navigate('/login')}
              onNavigateToSignup={() => navigate('/signup')}
            />
          } />
          <Route path="/privacy" element={<PrivacyPolicy onBack={() => navigate('/')} />} />
          <Route path="/terms" element={<TermsOfService onBack={() => navigate('/')} />} />
          <Route path="/contact" element={<ContactPage onBack={() => navigate('/')} />} />
          <Route path="/demo" element={<DemoPage onNavigateToApp={() => navigate('/app')} />} />
          <Route path="/pricing" element={
            <PricingPage 
              onNavigateToApp={() => navigate('/app')}
              onUpgrade={handleUpgrade} 
              onStartTrial={handleStartTrial} 
            />
          } />
          <Route path="/login" element={
            <LoginPage 
              onLogin={handleLogin}
              onNavigateToSignup={() => navigate('/signup')}
              onNavigateToHome={() => navigate('/')}
            />
          } />
          <Route path="/signup" element={
            <SignupPage 
              onSignup={handleSignup}
              onNavigateToLogin={() => navigate('/login')}
              onNavigateToHome={() => navigate('/')}
            />
          } />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard 
                user={user!}
                onLogout={handleLogout}
                onNavigateToProject={(projectId: string) => navigate(`/projects/${projectId}`)}
                onViewProjectDetails={(project: any) => navigate(`/projects/${project.id}`)}
                onNavigateToHome={() => navigate('/')}
                onNavigateToUpgrade={() => navigate('/upgrade')}
                onNavigateToSubscriptionManagement={() => navigate('/subscription')}
              />
            </ProtectedRoute>
          } />

          <Route path="/projects/:projectId" element={
            <ProtectedRoute>
              <ProjectDetails 
                projectId={window.location.pathname.split('/')[2]}
                onBack={() => navigate('/dashboard')}
                onEditProject={(updatedProject: any) => {
                  // Handle project update
                  console.log('Project updated:', updatedProject);
                }}
              />
            </ProtectedRoute>
          } />

          <Route path="/upgrade" element={
            <ProtectedRoute>
              <UpgradePage 
                onBack={() => navigate('/dashboard')}
                onUpgrade={handleUpgrade}
              />
            </ProtectedRoute>
          } />

          <Route path="/checkout" element={
            <ProtectedRoute>
              {checkoutPlan ? (
                <CheckoutPage 
                  plan={checkoutPlan}
                  interval={checkoutInterval}
                  onBack={() => navigate('/upgrade')}
                  onPaymentSuccess={() => navigate('/payment/success')}
                  onPaymentCancel={() => navigate('/payment/cancel')}
                />
              ) : (
                <Navigate to="/upgrade" replace />
              )}
            </ProtectedRoute>
          } />

          <Route path="/payment/success" element={
            <PaymentSuccess 
              onBack={() => {
                // Clear checkout data from localStorage
                localStorage.removeItem('checkoutPlan');
                localStorage.removeItem('checkoutInterval');
                navigate('/dashboard');
              }}
              onRefreshUser={refreshUserData}
            />
          } />

          <Route path="/payment/cancel" element={
            <PaymentCancel 
              onBack={() => {
                // Clear checkout data from localStorage
                localStorage.removeItem('checkoutPlan');
                localStorage.removeItem('checkoutInterval');
                navigate('/dashboard');
              }}
              onRetry={() => navigate('/upgrade')}
            />
          } />

          <Route path="/subscription" element={
            <ProtectedRoute>
              <SubscriptionManagement 
                onBack={() => navigate('/dashboard')}
                onUpgrade={handleUpgrade}
              />
            </ProtectedRoute>
          } />

          {/* App Routes (Multi-step Process) */}
          <Route path="/app" element={
            <ProtectedRoute>
              <AppMain 
                user={user!}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          } />

          <Route path="/app/upload" element={
            <ProtectedRoute>
              <AppMain 
                user={user!}
                onLogout={handleLogout}
                initialStep="upload"
              />
            </ProtectedRoute>
          } />

          <Route path="/app/generate" element={
            <ProtectedRoute>
              <AppMain 
                user={user!}
                onLogout={handleLogout}
                initialStep="generate"
              />
            </ProtectedRoute>
          } />

          <Route path="/app/review" element={
            <ProtectedRoute>
              <AppMain 
                user={user!}
                onLogout={handleLogout}
                initialStep="review"
              />
            </ProtectedRoute>
          } />

          <Route path="/app/embed" element={
            <ProtectedRoute>
              <AppMain 
                user={user!}
                onLogout={handleLogout}
                initialStep="embed"
              />
            </ProtectedRoute>
          } />

          {/* Widget Routes */}
          <Route path="/widget" element={<WidgetPage />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
  );
}

// Scroll to top component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Main App Component with Router
function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

// App Main Component (Multi-step Process)
interface AppMainProps {
  user: User;
  onLogout: () => void;
  initialStep?: Step;
}

const AppMain: React.FC<AppMainProps> = ({ initialStep = 'upload' }) => {
  const [currentStep, setCurrentStep] = useState<Step>(initialStep);
  const [extractedContent, setExtractedContent] = useState('');
  const [generatedFAQs, setGeneratedFAQs] = useState<FAQ[]>([]);
  const [currentProject] = useState<string | null>(null);
  const { success, error, info } = useToast();

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
    window.history.pushState({}, '', '/app/generate');
  };

  const handleFAQsGenerated = (faqs: FAQ[]) => {
    setGeneratedFAQs(faqs);
    success(`Generated ${faqs.length} FAQs successfully!`);
    setCurrentStep('review');
    window.history.pushState({}, '', '/app/review');
  };

  const handleFAQsPublished = () => {
    success('FAQs published successfully!');
    setCurrentStep('embed');
    window.history.pushState({}, '', '/app/embed');
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-50">
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
                />
              )}
              {currentStep === 'review' && (
                <FAQEditor
                  initialFAQs={generatedFAQs}
                  onPublish={handleFAQsPublished}
                  projectId={currentProject || undefined}
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
                  window.location.href = '/upgrade';
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Widget Page Component
const WidgetPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">FAQ Widget Demo</h1>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <iframe
            src={`${window.location.origin}/widget?project=demo`}
            width="100%"
            height="600"
            frameBorder="0"
            title="FAQ Widget Demo"
            className="rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default App;