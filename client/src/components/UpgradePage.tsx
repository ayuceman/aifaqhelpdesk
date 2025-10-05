import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
  onUpgrade: (planId: string, interval: 'month' | 'year') => void;
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
      onUpgrade(selectedPlan, selectedInterval);
    }
  };

  const formatPrice = (price: number, interval: 'month' | 'year') => {
    if (price === 0) return 'Free';
    return `$${price.toFixed(2)}/${interval === 'year' ? 'year' : 'month'}`;
  };

  const getYearlyDiscount = (monthlyPrice: number) => {
    const yearlyPrice = monthlyPrice * 12 * 0.8; // 20% discount
    const savings = (monthlyPrice * 12) - yearlyPrice;
    return Math.round(savings);
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-slate-900">Upgrade Your Plan</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Unlock advanced features and scale your AI-powered helpdesk with our flexible pricing plans.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedInterval('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedInterval === 'month'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedInterval('year')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedInterval === 'year'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly
              <span className="ml-1 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-lg border-2 p-6 ${
                plan.popular
                  ? 'border-blue-500 shadow-lg'
                  : 'border-slate-200 hover:border-slate-300'
              } ${selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 text-xs font-medium rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-slate-900">
                    {formatPrice(plan.price, selectedInterval)}
                  </span>
                  {plan.price > 0 && selectedInterval === 'year' && (
                    <div className="text-sm text-green-600 mt-1">
                      Save ${getYearlyDiscount(plan.price)}/year
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    selectedPlan === plan.id
                      ? 'bg-blue-600 text-white'
                      : plan.popular
                      ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                </button>
              </div>

              <div className="mt-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Limits Display */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h4 className="text-sm font-medium text-slate-900 mb-3">Limits</h4>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>FAQs:</span>
                    <span>{plan.limits.maxFAQs === -1 ? 'Unlimited' : plan.limits.maxFAQs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Chats:</span>
                    <span>{plan.limits.maxChatQuestionsPerDay === -1 ? 'Unlimited' : plan.limits.maxChatQuestionsPerDay.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Chats:</span>
                    <span>{plan.limits.maxChatQuestionsTotal === -1 ? 'Unlimited' : plan.limits.maxChatQuestionsTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Upgrade Button */}
        {selectedPlan && (
          <div className="text-center">
            <button
              onClick={handleUpgrade}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Upgrade to {plans.find(p => p.id === selectedPlan)?.name} Plan
            </button>
            <p className="text-sm text-slate-500 mt-4">
              You'll be redirected to PayPal to complete your payment securely.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default UpgradePage;
