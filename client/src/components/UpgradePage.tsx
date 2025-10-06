import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from './DashboardLayout';
import {
  CheckCircleIcon,
  SparklesIcon,
  RocketLaunchIcon,
  BoltIcon,
  ShieldCheckIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    maxFAQs: number;
    maxChatQuestionsPerDay: number;
    maxChatQuestionsTotal: number;
  };
  popular?: boolean;
}

interface UpgradePageProps {
  onBack: () => void;
  onUpgrade: (plan: PricingPlan, interval: 'month' | 'year') => void;
}

const UpgradePage: React.FC<UpgradePageProps> = ({ onBack, onUpgrade }) => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState<'month' | 'year'>('month');
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const fetchPricingPlans = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/payment/plans');
      if (response.data.success) {
        setPlans(response.data.plans);
      }
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleUpgrade = () => {
    if (selectedPlan) {
      const plan = plans.find(p => p.id === selectedPlan);
      if (plan) {
        localStorage.setItem('checkoutPlan', JSON.stringify(plan));
        localStorage.setItem('checkoutInterval', selectedInterval);
        onUpgrade(plan, selectedInterval);
      }
    }
  };

  const formatPrice = (price: number, interval: 'month' | 'year') => {
    if (price === 0) return '0';
    if (interval === 'year') {
      return (price * 12 * 0.8).toFixed(0); // 20% discount
    }
    return price.toFixed(0);
  };

  const getYearlyDiscount = (monthlyPrice: number) => {
    const yearlyPrice = monthlyPrice * 12 * 0.8;
    const savings = (monthlyPrice * 12) - yearlyPrice;
    return Math.round(savings);
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

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free': return SparklesIcon;
      case 'starter': return RocketLaunchIcon;
      case 'professional': return BoltIcon;
      case 'enterprise': return ShieldCheckIcon;
      default: return SparklesIcon;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading pricing plans...</p>
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
            <h1 className="text-2xl font-bold text-slate-900">Choose Your Plan</h1>
            <p className="text-slate-600 text-sm mt-1">Select the perfect plan for your needs</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <StarIcon className="w-4 h-4" />
            <span>Flexible pricing for every business size</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Scale Your AI Support
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Unlock powerful features and grow your customer support capabilities with our flexible pricing plans
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-2xl p-1.5 shadow-lg border border-slate-200">
            <button
              onClick={() => setSelectedInterval('month')}
              className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all ${
                selectedInterval === 'month'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setSelectedInterval('year')}
              className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all ${
                selectedInterval === 'year'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly Billing
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                💰 Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => {
            const PlanIcon = getPlanIcon(plan.id);
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl border-2 p-8 transition-all duration-300 transform hover:-translate-y-2 ${
                  plan.popular
                    ? 'border-blue-400 shadow-2xl scale-105'
                    : selectedPlan === plan.id
                    ? 'border-blue-400 shadow-xl'
                    : 'border-slate-200 hover:border-blue-300 hover:shadow-lg'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1">
                      <StarIcon className="w-4 h-4" />
                      <span>MOST POPULAR</span>
                    </div>
                  </div>
                )}

                {/* Plan Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${getPlanGradient(plan.id)} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                  <PlanIcon className="w-8 h-8 text-white" />
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-slate-900">
                      ${formatPrice(plan.price, selectedInterval)}
                    </span>
                    <span className="text-slate-600 ml-2">
                      /{selectedInterval === 'year' ? 'year' : 'mo'}
                    </span>
                  </div>
                  {plan.price > 0 && selectedInterval === 'year' && (
                    <div className="text-sm text-green-600 font-medium mt-2 flex items-center">
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Save ${getYearlyDiscount(plan.price)} annually
                    </div>
                  )}
                </div>

                {/* Select Button */}
                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full py-3.5 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg mb-6 ${
                    selectedPlan === plan.id
                      ? `bg-gradient-to-r ${getPlanGradient(plan.id)} text-white`
                      : plan.popular
                      ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {selectedPlan === plan.id ? '✓ Selected' : 'Select Plan'}
                </button>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Limits */}
                <div className="pt-6 border-t border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Plan Limits</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Max FAQs</span>
                      <span className="font-semibold text-slate-900">
                        {plan.limits.maxFAQs === -1 ? '∞ Unlimited' : plan.limits.maxFAQs.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Daily Chats</span>
                      <span className="font-semibold text-slate-900">
                        {plan.limits.maxChatQuestionsPerDay === -1 ? '∞ Unlimited' : plan.limits.maxChatQuestionsPerDay.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Total Chats</span>
                      <span className="font-semibold text-slate-900">
                        {plan.limits.maxChatQuestionsTotal === -1 ? '∞ Unlimited' : plan.limits.maxChatQuestionsTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upgrade CTA */}
        {selectedPlan && (
          <div className="text-center bg-white rounded-2xl shadow-lg border border-slate-200 p-8 animate-scale-in">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Ready to upgrade to {plans.find(p => p.id === selectedPlan)?.name}?
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              You'll be securely redirected to PayPal to complete your payment. Your subscription will be active immediately.
            </p>
            <button
              onClick={handleUpgrade}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-bold rounded-xl shadow-xl transition-all transform hover:scale-105 inline-flex items-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <p className="text-xs text-slate-500 mt-4">
              🔒 Secure payment powered by PayPal
            </p>
          </div>
        )}

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-600 mb-6">Trusted by 10,000+ businesses worldwide</p>
          <div className="flex justify-center items-center space-x-8 text-slate-400">
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-5 h-5" />
              <span className="text-sm">SSL Secured</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="text-sm">GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <StarIcon className="w-5 h-5" />
              <span className="text-sm">99.9% Uptime</span>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default UpgradePage;
