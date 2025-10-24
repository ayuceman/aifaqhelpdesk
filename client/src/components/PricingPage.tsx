import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface PricingPageProps {
  onNavigateToApp?: () => void;
  onUpgrade?: (plan: any, interval: 'month' | 'year') => void;
  onStartTrial?: (plan: any) => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onNavigateToApp, onUpgrade: _onUpgrade, onStartTrial }) => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/payment/plans');
        const data = await response.json();
        if (data.success) {
          setPlans(data.plans);
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error);
        // Fallback to default plans if API fails
        setPlans(defaultPlans);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const defaultPlans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for trying out the platform',
      features: [
        '50 FAQs maximum',
        '100 chat questions per month',
        'Basic analytics',
        'Community support',
        '1 project',
        'Mobile responsive widget'
      ],
      limitations: [
        'Limited to 1 project',
        'Basic features only',
        'AI FAQ Generator branding'
      ],
      popular: false,
      cta: 'Get Started Free',
      ctaVariant: 'secondary' as const
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 15,
      period: 'month',
      description: 'Perfect for small businesses getting started',
      features: [
        '500 FAQs maximum',
        '1,000 chat questions per month',
        'Basic analytics dashboard',
        'Email support',
        'Up to 3 projects',
        'Mobile responsive widget',
        'Custom branding'
      ],
      limitations: [
        'Up to 3 projects',
        'Email support only'
      ],
      popular: false,
      cta: 'Start Free Trial',
      ctaVariant: 'secondary' as const
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 39,
      period: 'month',
      description: 'Ideal for growing businesses with higher needs',
      features: [
        '2,500 FAQs maximum',
        '5,000 chat questions per month',
        'Advanced analytics & insights',
        'Priority email support',
        'Up to 10 projects',
        'API access',
        'Advanced customization',
        'Remove branding',
        'Export functionality'
      ],
      limitations: [],
      popular: true,
      cta: 'Start Free Trial',
      ctaVariant: 'primary' as const
    },
    {
      id: 'business',
      name: 'Business',
      price: 79,
      period: 'month',
      description: 'For agencies and teams with multiple clients',
      features: [
        '10,000 FAQs maximum',
        '15,000 chat questions per month',
        'Advanced analytics & reports',
        'Priority phone & email support',
        'Unlimited projects',
        'Full API access',
        'White-label solution',
        'Custom integrations',
        'Team collaboration tools',
        'Dedicated account manager'
      ],
      limitations: [],
      popular: false,
      cta: 'Start Free Trial',
      ctaVariant: 'secondary' as const
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      period: 'month',
      description: 'For large organizations with unlimited needs',
      features: [
        'Unlimited FAQs',
        'Unlimited chat questions',
        'Enterprise-grade analytics',
        '24/7 dedicated support',
        'Unlimited projects',
        'Full API & webhook access',
        'White-label solution',
        'Custom integrations',
        'Advanced security (SSO, SAML)',
        'SLA guarantee (99.9% uptime)',
        'Custom training & onboarding',
        'Dedicated success manager'
      ],
      limitations: [],
      popular: false,
      cta: 'Contact Sales',
      ctaVariant: 'secondary' as const
    }
  ];

  const faqs = [
    {
      question: 'Is there really a free plan?',
      answer: 'Yes! Our free plan includes 100 FAQs and 500 chat questions per month, perfect for trying out the platform or small projects. No credit card required.'
    },
    {
      question: 'What happens after my 14-day trial ends?',
      answer: 'After your trial ends, you can choose any of our paid plans to continue using the service. Your data and settings will be preserved when you upgrade.'
    },
    {
      question: 'Can I change my plan later?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing differences.'
    },
    {
      question: 'What counts as a chat question?',
      answer: 'A chat question is any message sent by a user to your chatbot widget. This includes questions, greetings, and follow-up messages.'
    },
    {
      question: 'Do you offer custom pricing?',
      answer: 'Yes! For Enterprise customers with specific needs, we offer custom pricing and features. Contact our sales team to discuss your requirements.'
    },
    {
      question: 'Is there a setup fee?',
      answer: 'No setup fees! All plans include free setup and onboarding. We want you to get started quickly and easily.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and for Enterprise customers, we can arrange bank transfers and purchase orders.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <Header variant="landing" />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Choose the perfect plan for your business. Start with our free plan or a 14-day free trial, 
            no credit card required.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
            <span className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Free plan available
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No setup fees
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Cancel anytime
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-slate-600">Loading plans...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
             {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                  plan.id === 'professional'
                    ? 'border-blue-500 transform scale-105'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {plan.id === 'professional' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                    <p className="text-slate-600 mb-6">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-5xl font-bold text-slate-900">${plan.price}</span>
                      <span className="text-slate-600">/{plan.interval || 'month'}</span>
                    </div>
                    <button
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                        plan.id === 'professional'
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                      }`}
                      onClick={() => {
                        if (plan.id === 'free') {
                          onNavigateToApp?.();
                        } else {
                          // For paid plans, start a trial instead of going to checkout
                          onStartTrial?.(plan);
                        }
                      }}
                    >
                      {plan.id === 'free' ? 'Get Started Free' : 'Start Free Trial'}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900 mb-3">What's included:</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature: string, featureIndex: number) => (
                        <li key={featureIndex} className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Compare Plans
            </h2>
            <p className="text-xl text-slate-600">
              See exactly what's included in each plan
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Features</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-900">Free</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-900">Starter</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-900">Professional</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 font-medium text-slate-900">FAQs</td>
                  <td className="text-center py-4 px-6 text-slate-600">100</td>
                  <td className="text-center py-4 px-6 text-slate-600">1,000</td>
                  <td className="text-center py-4 px-6 text-slate-600">5,000</td>
                  <td className="text-center py-4 px-6 text-slate-600">Unlimited</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 font-medium text-slate-900">Chat Questions/Month</td>
                  <td className="text-center py-4 px-6 text-slate-600">500</td>
                  <td className="text-center py-4 px-6 text-slate-600">2,000</td>
                  <td className="text-center py-4 px-6 text-slate-600">10,000</td>
                  <td className="text-center py-4 px-6 text-slate-600">Unlimited</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 font-medium text-slate-900">Projects</td>
                  <td className="text-center py-4 px-6 text-slate-600">1</td>
                  <td className="text-center py-4 px-6 text-slate-600">1</td>
                  <td className="text-center py-4 px-6 text-slate-600">5</td>
                  <td className="text-center py-4 px-6 text-slate-600">Unlimited</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 font-medium text-slate-900">Analytics</td>
                  <td className="text-center py-4 px-6 text-slate-600">Basic</td>
                  <td className="text-center py-4 px-6 text-slate-600">Basic</td>
                  <td className="text-center py-4 px-6 text-slate-600">Advanced</td>
                  <td className="text-center py-4 px-6 text-slate-600">Advanced</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 font-medium text-slate-900">API Access</td>
                  <td className="text-center py-4 px-6 text-slate-600">-</td>
                  <td className="text-center py-4 px-6 text-slate-600">-</td>
                  <td className="text-center py-4 px-6 text-slate-600">✓</td>
                  <td className="text-center py-4 px-6 text-slate-600">Full Access</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 font-medium text-slate-900">Custom Branding</td>
                  <td className="text-center py-4 px-6 text-slate-600">-</td>
                  <td className="text-center py-4 px-6 text-slate-600">-</td>
                  <td className="text-center py-4 px-6 text-slate-600">✓</td>
                  <td className="text-center py-4 px-6 text-slate-600">White-label</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 font-medium text-slate-900">Support</td>
                  <td className="text-center py-4 px-6 text-slate-600">Community</td>
                  <td className="text-center py-4 px-6 text-slate-600">Email</td>
                  <td className="text-center py-4 px-6 text-slate-600">Priority</td>
                  <td className="text-center py-4 px-6 text-slate-600">24/7 Phone</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses already using AI FAQ Generator
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onNavigateToApp}
              className="btn-primary bg-white text-blue-600 hover:bg-blue-50"
            >
              Start Free Trial
            </button>
            <Link
              to="/contact"
              className="btn-secondary border-white text-white hover:bg-white hover:text-blue-600"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PricingPage;
