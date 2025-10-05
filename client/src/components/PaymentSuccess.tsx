import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, ArrowRightIcon, SparklesIcon, ChartBarIcon, CogIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface PaymentSuccessProps {
  onBack: () => void;
  onRefreshUser?: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onBack, onRefreshUser }) => {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Get orderId from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdParam = urlParams.get('orderId');
    if (orderIdParam) {
      setOrderId(orderIdParam);
    }
    
    // Refresh user data to get updated subscription info
    if (onRefreshUser) {
      onRefreshUser();
    }
    
    fetchSubscriptionDetails();
  }, [onRefreshUser]);

  const fetchSubscriptionDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/payment/subscription', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSubscription(data.subscription);
        }
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button onClick={onBack} className="text-slate-600 hover:text-slate-900 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-slate-900">Subscription Activated</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          {/* Success Animation */}
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-8 shadow-lg">
            <CheckCircleIcon className="w-12 h-12 text-white" />
          </div>

          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            🎉 Welcome to Premium!
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Your subscription has been successfully activated. You now have access to all premium features and unlimited usage.
          </p>
          
          {orderId && (
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 mb-8 max-w-md mx-auto border border-slate-200">
              <p className="text-sm text-slate-600">
                <span className="font-medium">Transaction ID:</span> {orderId}
              </p>
            </div>
          )}
        </div>

        {/* Subscription Details Card */}
        {subscription && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-8 mb-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Your Subscription</h3>
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Plan:</span>
                  <span className="font-semibold text-slate-900 capitalize">{subscription.plan}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Billing Cycle:</span>
                  <span className="font-semibold text-slate-900 capitalize">{subscription.interval}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Status:</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {subscription.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                {subscription.endDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Next Billing:</span>
                    <span className="font-semibold text-slate-900">
                      {new Date(subscription.endDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Features:</span>
                  <span className="font-semibold text-slate-900">{subscription.features?.length || 0} unlocked</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Unlocked */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-8 mb-8 shadow-lg">
          <div className="flex items-center mb-6">
            <SparklesIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-2xl font-bold text-slate-900">Features Unlocked</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscription?.features?.map((feature: string, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <p className="text-slate-700 font-medium">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-8 mb-8 shadow-lg">
          <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">What's Next?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <ChartBarIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-900 mb-2">Create Your First FAQ</h4>
              <p className="text-sm text-slate-600 mb-4">Upload documents or crawl websites to generate intelligent FAQs</p>
              <button 
                onClick={onBack}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <CogIcon className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-900 mb-2">Customize Your Widget</h4>
              <p className="text-sm text-slate-600 mb-4">Personalize the chat widget to match your brand</p>
              <button 
                onClick={() => window.open('/widget', '_blank')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Preview Widget
              </button>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <SparklesIcon className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-900 mb-2">Embed Everywhere</h4>
              <p className="text-sm text-slate-600 mb-4">Add the widget to your website, app, or documentation</p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`<iframe src="http://localhost:3001/widget" width="400" height="600" frameborder="0"></iframe>`);
                  alert('Embed code copied to clipboard!');
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Copy Embed Code
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onBack}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            Go to Dashboard
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </button>
          
          <button
            onClick={() => window.open('/widget', '_blank')}
            className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            Test Your Widget
          </button>
        </div>

        {/* Footer Message */}
        <div className="text-center mt-12">
          <p className="text-slate-500 mb-2">
            🎉 You're all set! Your premium subscription is now active.
          </p>
          <p className="text-sm text-slate-400">
            You'll receive a confirmation email shortly with your subscription details and next steps.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;