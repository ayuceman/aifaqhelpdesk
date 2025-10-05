import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CreditCardIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface Subscription {
  plan: string;
  interval: string;
  status: string;
  startDate?: string;
  endDate?: string;
  features: string[];
  limits: {
    maxFAQs: number;
    maxChatQuestionsPerDay: number;
    maxChatQuestionsTotal: number;
  };
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  limits: {
    maxFAQs: number;
    maxChatQuestionsPerDay: number;
    maxChatQuestionsTotal: number;
  };
  popular?: boolean;
}

interface SubscriptionManagementProps {
  onBack: () => void;
  onUpgrade: (plan: PricingPlan, interval: 'month' | 'year') => void;
}

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ 
  onBack, 
  onUpgrade 
}) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
    fetchPricingPlans();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/payment/subscription', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSubscription(response.data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchPricingPlans = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/payment/plans');
      if (response.data.success) {
        setPricingPlans(response.data.plans);
      }
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
      return;
    }

    setCancelling(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3001/api/payment/cancel-subscription', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        alert('Subscription cancelled successfully');
        fetchSubscriptionData(); // Refresh data
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-orange-600 bg-orange-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="w-5 h-5" />;
      case 'inactive': return <XCircleIcon className="w-5 h-5" />;
      case 'cancelled': return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'expired': return <XCircleIcon className="w-5 h-5" />;
      default: return <ExclamationTriangleIcon className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCurrentPlan = () => {
    return pricingPlans.find(plan => plan.id === subscription?.plan);
  };

  const getAvailablePlans = () => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return pricingPlans;
    
    return pricingPlans.filter(plan => {
      // Don't show the current plan
      if (plan.id === currentPlan.id) return false;
      // For free users, show all paid plans
      if (currentPlan.id === 'free') return plan.id !== 'free';
      // For paid users, show all plans including free
      return true;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button onClick={onBack} className="text-slate-600 hover:text-slate-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-slate-900">Subscription Management</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Subscription Overview */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Current Subscription</h2>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription?.status || 'inactive')}`}>
              {getStatusIcon(subscription?.status || 'inactive')}
              <span className="capitalize">{subscription?.status || 'Inactive'}</span>
            </div>
          </div>

          {subscription && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Plan Details */}
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CreditCardIcon className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 capitalize">{subscription.plan} Plan</h3>
                    <p className="text-sm text-slate-600 capitalize">{subscription.interval} billing</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Started:</span>
                    <span className="font-medium">{formatDate(subscription.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Next billing:</span>
                    <span className="font-medium">{formatDate(subscription.endDate)}</span>
                  </div>
                </div>
              </div>

              {/* Usage Limits */}
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <ChartBarIcon className="w-8 h-8 text-green-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Usage Limits</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Max FAQs:</span>
                    <span className="font-medium">
                      {subscription.limits.maxFAQs === -1 ? 'Unlimited' : subscription.limits.maxFAQs}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Daily chats:</span>
                    <span className="font-medium">
                      {subscription.limits.maxChatQuestionsPerDay === -1 ? 'Unlimited' : subscription.limits.maxChatQuestionsPerDay}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total chats:</span>
                    <span className="font-medium">
                      {subscription.limits.maxChatQuestionsTotal === -1 ? 'Unlimited' : subscription.limits.maxChatQuestionsTotal}
                    </span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-purple-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Features</h3>
                </div>
                <ul className="space-y-1 text-sm">
                  {subscription.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-center text-slate-600">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {subscription.features.length > 4 && (
                    <li className="text-xs text-slate-500">
                      +{subscription.features.length - 4} more features
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-slate-200">
            {subscription?.status === 'active' && (
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {cancelling ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircleIcon className="w-5 h-5 mr-2" />
                    Cancel Subscription
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="bg-slate-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-700 transition-colors flex items-center justify-center"
            >
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              Refresh Status
            </button>
          </div>
        </div>

        {/* Available Plans */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Available Plans</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getAvailablePlans().map((plan) => (
              <div key={plan.id} className={`border rounded-lg p-6 ${plan.popular ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
                {plan.popular && (
                  <div className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-600 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-3xl font-bold text-slate-900">${plan.price}</span>
                  <span className="text-slate-600">/month</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-slate-600">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => onUpgrade(plan, 'month')}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    plan.id === 'free' 
                      ? 'bg-slate-600 text-white hover:bg-slate-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {plan.id === 'free' ? 'Downgrade to Free' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionManagement;
