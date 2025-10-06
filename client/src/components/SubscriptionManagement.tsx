import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from './DashboardLayout';
import { 
  CreditCardIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  SparklesIcon,
  RocketLaunchIcon,
  BoltIcon
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
      case 'active': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'inactive': return 'bg-gradient-to-r from-red-500 to-rose-500';
      case 'cancelled': return 'bg-gradient-to-r from-orange-500 to-amber-500';
      case 'expired': return 'bg-gradient-to-r from-gray-500 to-slate-500';
      default: return 'bg-gradient-to-r from-gray-500 to-slate-500';
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
      if (plan.id === currentPlan.id) return false;
      if (currentPlan.id === 'free') return plan.id !== 'free';
      return true;
    });
  };

  const getPlanGradient = (planId: string) => {
    const gradients: { [key: string]: string } = {
      free: 'from-slate-500 to-slate-600',
      starter: 'from-green-500 to-emerald-600',
      professional: 'from-purple-500 to-indigo-600',
      enterprise: 'from-orange-500 to-red-600'
    };
    return gradients[planId] || 'from-blue-500 to-indigo-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Billing & Subscription</h1>
            <p className="text-slate-600 text-sm mt-1">Manage your plan and billing information</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Subscription Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          {/* Status Banner */}
          <div className={`${getStatusColor(subscription?.status || 'inactive')} px-8 py-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-white">
                {getStatusIcon(subscription?.status || 'inactive')}
                <div>
                  <p className="text-sm font-medium opacity-90">Subscription Status</p>
                  <h2 className="text-2xl font-bold capitalize">{subscription?.status || 'Inactive'}</h2>
                </div>
              </div>
              <div className="text-right text-white">
                <p className="text-sm opacity-90">Current Plan</p>
                <h3 className="text-2xl font-bold capitalize">{subscription?.plan || 'None'}</h3>
              </div>
            </div>
          </div>

          {subscription && (
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Plan Details Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <CreditCardIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Plan Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Billing Cycle</p>
                      <p className="text-sm font-semibold text-slate-900 capitalize">{subscription.interval}ly</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Start Date</p>
                      <p className="text-sm font-semibold text-slate-900">{formatDate(subscription.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Next Billing</p>
                      <p className="text-sm font-semibold text-slate-900">{formatDate(subscription.endDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Usage Limits Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <ChartBarIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Usage Limits</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Max FAQs</span>
                      <span className="text-sm font-bold text-slate-900">
                        {subscription.limits.maxFAQs === -1 ? '∞' : subscription.limits.maxFAQs}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Daily Chats</span>
                      <span className="text-sm font-bold text-slate-900">
                        {subscription.limits.maxChatQuestionsPerDay === -1 ? '∞' : subscription.limits.maxChatQuestionsPerDay}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Total Chats</span>
                      <span className="text-sm font-bold text-slate-900">
                        {subscription.limits.maxChatQuestionsTotal === -1 ? '∞' : subscription.limits.maxChatQuestionsTotal}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features Card */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <ShieldCheckIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Included Features</h3>
                  <ul className="space-y-2">
                    {subscription.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-slate-700">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {subscription.features.length > 3 && (
                      <li className="text-xs text-purple-600 font-medium pl-6">
                        +{subscription.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-200">
                {subscription?.status === 'active' && (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={cancelling}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center space-x-2"
                  >
                    {cancelling ? (
                      <>
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        <span>Cancelling...</span>
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="w-5 h-5" />
                        <span>Cancel Subscription</span>
                      </>
                    )}
                  </button>
                )}
                
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all shadow-lg flex items-center space-x-2"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                  <span>Refresh Status</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Available Plans */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Upgrade or Change Plan</h2>
            <p className="text-slate-600">Choose a plan that fits your needs and scale as you grow</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getAvailablePlans().map((plan) => (
              <div 
                key={plan.id} 
                className={`relative bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-xl ${
                  plan.popular 
                    ? 'border-blue-400 shadow-lg scale-105' 
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                      ⭐ MOST POPULAR
                    </span>
                  </div>
                )}
                
                <div className={`w-14 h-14 bg-gradient-to-br ${getPlanGradient(plan.id)} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                  {plan.id === 'free' && <SparklesIcon className="w-7 h-7 text-white" />}
                  {plan.id === 'starter' && <RocketLaunchIcon className="w-7 h-7 text-white" />}
                  {plan.id === 'professional' && <BoltIcon className="w-7 h-7 text-white" />}
                  {plan.id === 'enterprise' && <ShieldCheckIcon className="w-7 h-7 text-white" />}
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-600 text-sm mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
                  <span className="text-slate-600 ml-2">/month</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm text-slate-700">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    localStorage.setItem('checkoutPlan', JSON.stringify(plan));
                    localStorage.setItem('checkoutInterval', 'month');
                    onUpgrade(plan, 'month');
                  }}
                  className={`w-full py-3.5 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg ${
                    plan.id === 'free' 
                      ? 'bg-slate-600 hover:bg-slate-700 text-white' 
                      : `bg-gradient-to-r ${getPlanGradient(plan.id)} hover:opacity-90 text-white`
                  }`}
                >
                  {plan.id === 'free' ? 'Downgrade to Free' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default SubscriptionManagement;
