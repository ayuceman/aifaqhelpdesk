import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, ArrowRightIcon, SparklesIcon, ChartBarIcon, Cog6ToothIcon, ShieldCheckIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

interface PaymentSuccessProps {
  onBack: () => void;
  onRefreshUser?: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onBack, onRefreshUser }) => {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdParam = urlParams.get('orderId');
    if (orderIdParam) {
      setOrderId(orderIdParam);
    }
    
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Activating your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100">
      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          {/* Success Animation */}
          <div className="relative mx-auto w-32 h-32 mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
            <div className="relative w-32 h-32 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl transform animate-bounce">
              <CheckCircleIcon className="w-16 h-16 text-white" />
            </div>
          </div>

          <h2 className="text-5xl font-bold text-slate-900 mb-4">
            🎉 Welcome to Premium!
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Your subscription is now active! Get ready to supercharge your customer support with AI-powered FAQs.
          </p>
          
          {orderId && (
            <div className="bg-white rounded-lg p-4 mb-8 max-w-md mx-auto border-2 border-green-200 shadow-lg">
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-green-700">Transaction ID:</span>{' '}
                <span className="font-mono">{orderId}</span>
              </p>
            </div>
          )}
        </div>

        {/* Subscription Details Card */}
        {subscription && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Your Active Subscription</h3>
              <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
                <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm font-bold text-green-700">ACTIVE</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <p className="text-sm text-slate-600 mb-2">Plan</p>
                <p className="text-2xl font-bold text-slate-900 capitalize">{subscription.plan}</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <p className="text-sm text-slate-600 mb-2">Billing Cycle</p>
                <p className="text-2xl font-bold text-slate-900 capitalize">{subscription.interval}ly</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <p className="text-sm text-slate-600 mb-2">Next Billing</p>
                <p className="text-lg font-bold text-slate-900">
                  {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Features Unlocked */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8 shadow-xl">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <SparklesIcon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Premium Features Unlocked</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscription?.features?.map((feature: string, index: number) => (
              <div key={index} className="flex items-start space-x-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
                <p className="text-slate-700 font-medium">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8 shadow-xl">
          <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">🚀 Get Started in 3 Easy Steps</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-25 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-white rounded-2xl p-6 border-2 border-blue-200 hover:border-blue-400 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <ChartBarIcon className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2 text-lg">1. Create FAQ</h4>
                <p className="text-sm text-slate-600 mb-4">Upload documents or crawl websites to generate intelligent FAQs automatically</p>
                <button 
                  onClick={onBack}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                >
                  Create Now →
                </button>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl opacity-25 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-white rounded-2xl p-6 border-2 border-green-200 hover:border-green-400 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Cog6ToothIcon className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2 text-lg">2. Customize</h4>
                <p className="text-sm text-slate-600 mb-4">Personalize the chat widget to match your brand colors and style</p>
                <button 
                  onClick={() => window.open('/widget', '_blank')}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
                >
                  Preview Widget →
                </button>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-25 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-white rounded-2xl p-6 border-2 border-purple-200 hover:border-purple-400 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <RocketLaunchIcon className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2 text-lg">3. Deploy</h4>
                <p className="text-sm text-slate-600 mb-4">Add the widget to your website, app, or documentation</p>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`<iframe src="http://localhost:3001/widget" width="400" height="600" frameborder="0"></iframe>`);
                    alert('Embed code copied to clipboard!');
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                >
                  Copy Code →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={onBack}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center"
          >
            Go to Dashboard
            <ArrowRightIcon className="w-6 h-6 ml-2" />
          </button>
        </div>

        {/* Footer Message */}
        <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <p className="text-lg font-semibold text-slate-900 mb-2">
            🎉 You're all set! Your premium subscription is now active.
          </p>
          <p className="text-sm text-slate-600">
            You'll receive a confirmation email shortly with your subscription details and invoice.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;
