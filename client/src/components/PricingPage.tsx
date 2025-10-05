import React from 'react';

interface PricingPageProps {
  onNavigateToApp?: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onNavigateToApp }) => {
  const plans = [
    {
      name: 'Starter',
      price: 19,
      period: 'month',
      description: 'Perfect for small businesses getting started',
      features: [
        '1,000 FAQs maximum',
        '2,000 chat questions per month',
        'Basic analytics dashboard',
        'Email support',
        'Standard templates',
        'Mobile responsive widget'
      ],
      limitations: [
        'Limited to 1 project',
        'Basic customization only'
      ],
      popular: false,
      cta: 'Start Free Trial',
      ctaVariant: 'secondary' as const
    },
    {
      name: 'Professional',
      price: 49,
      period: 'month',
      description: 'Ideal for growing businesses with higher needs',
      features: [
        '5,000 FAQs maximum',
        '10,000 chat questions per month',
        'Advanced analytics & insights',
        'Priority email support',
        'Custom branding & themes',
        'Multiple projects (up to 5)',
        'API access',
        'Advanced customization',
        'Integration with popular tools'
      ],
      limitations: [],
      popular: true,
      cta: 'Start Free Trial',
      ctaVariant: 'primary' as const
    },
    {
      name: 'Enterprise',
      price: 149,
      period: 'month',
      description: 'For large organizations with unlimited needs',
      features: [
        'Unlimited FAQs',
        'Unlimited chat questions',
        'White-label solution',
        'Full API access',
        'Custom integrations',
        'Unlimited projects',
        'Dedicated account manager',
        '24/7 phone support',
        'Custom training & onboarding',
        'SLA guarantees'
      ],
      limitations: [],
      popular: false,
      cta: 'Contact Sales',
      ctaVariant: 'secondary' as const
    }
  ];

  const faqs = [
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
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-slate-900">AI FAQ Generator</h1>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={onNavigateToApp}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Get Started
              </button>
              <a href="/demo" className="text-slate-600 hover:text-slate-900 transition-colors">
                Demo
              </a>
              <a href="/contact" className="text-slate-600 hover:text-slate-900 transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Choose the perfect plan for your business. Start with a 14-day free trial, 
            no credit card required.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
            <span className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              14-day free trial
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                  plan.popular
                    ? 'border-blue-500 transform scale-105'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {plan.popular && (
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
                      <span className="text-slate-600">/{plan.period}</span>
                    </div>
                    <button
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                        plan.ctaVariant === 'primary'
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                      }`}
                      onClick={onNavigateToApp}
                    >
                      {plan.cta}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900 mb-3">What's included:</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h4 className="font-semibold text-slate-900 mb-3">Limitations:</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, limitationIndex) => (
                          <li key={limitationIndex} className="flex items-start">
                            <svg className="w-4 h-4 text-slate-400 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span className="text-slate-500 text-sm">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
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
                  <th className="text-center py-4 px-6 font-semibold text-slate-900">Starter</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-900">Professional</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 font-medium text-slate-900">FAQs</td>
                  <td className="text-center py-4 px-6 text-slate-600">1,000</td>
                  <td className="text-center py-4 px-6 text-slate-600">5,000</td>
                  <td className="text-center py-4 px-6 text-slate-600">Unlimited</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 font-medium text-slate-900">Chat Questions/Month</td>
                  <td className="text-center py-4 px-6 text-slate-600">2,000</td>
                  <td className="text-center py-4 px-6 text-slate-600">10,000</td>
                  <td className="text-center py-4 px-6 text-slate-600">Unlimited</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 font-medium text-slate-900">Projects</td>
                  <td className="text-center py-4 px-6 text-slate-600">1</td>
                  <td className="text-center py-4 px-6 text-slate-600">5</td>
                  <td className="text-center py-4 px-6 text-slate-600">Unlimited</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 font-medium text-slate-900">Analytics</td>
                  <td className="text-center py-4 px-6 text-slate-600">Basic</td>
                  <td className="text-center py-4 px-6 text-slate-600">Advanced</td>
                  <td className="text-center py-4 px-6 text-slate-600">Advanced</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 font-medium text-slate-900">API Access</td>
                  <td className="text-center py-4 px-6 text-slate-600">-</td>
                  <td className="text-center py-4 px-6 text-slate-600">✓</td>
                  <td className="text-center py-4 px-6 text-slate-600">Full Access</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 font-medium text-slate-900">Custom Branding</td>
                  <td className="text-center py-4 px-6 text-slate-600">-</td>
                  <td className="text-center py-4 px-6 text-slate-600">✓</td>
                  <td className="text-center py-4 px-6 text-slate-600">White-label</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 font-medium text-slate-900">Support</td>
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
            <a
              href="/contact"
              className="btn-secondary border-white text-white hover:bg-white hover:text-blue-600"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">AI FAQ Generator</h3>
              <p className="text-slate-400">
                Transform your content into intelligent FAQ systems and chatbot assistants.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="/demo" className="hover:text-white transition-colors">Demo</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/features" className="hover:text-white transition-colors">Features</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/docs" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 AI FAQ Generator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
