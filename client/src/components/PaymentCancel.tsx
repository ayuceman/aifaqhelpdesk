import React, { useEffect, useState } from 'react';
import { XCircleIcon, ArrowLeftIcon, ArrowPathIcon, ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface PaymentCancelProps {
  onBack: () => void;
  onRetry: () => void;
}

const PaymentCancel: React.FC<PaymentCancelProps> = ({ onBack, onRetry }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam) {
      setError(errorParam);
    }
  }, []);

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'missing_token':
        return 'Payment token was missing. Please try again.';
      case 'capture_failed':
        return 'Payment capture failed. Please contact support if you were charged.';
      case 'processing_failed':
        return 'Payment processing failed. Please try again.';
      default:
        return 'An unexpected error occurred during payment.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-100">
      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          {/* Cancel Icon */}
          <div className="relative mx-auto w-32 h-32 mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse opacity-50"></div>
            <div className="relative w-32 h-32 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl">
              <XCircleIcon className="w-16 h-16 text-white" />
            </div>
          </div>

          <h2 className="text-5xl font-bold text-slate-900 mb-4">
            Payment Cancelled
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            No worries! Your payment was cancelled and no charges were made. You can try again whenever you're ready.
          </p>
          
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8 max-w-md mx-auto shadow-lg">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="text-sm font-bold text-red-800 mb-1">Error Details</h3>
                  <p className="text-sm text-red-600">{getErrorMessage(error)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* What Happened */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">What Happened?</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start bg-blue-50 rounded-lg p-4 border border-blue-200">
                <ShieldCheckIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-slate-700">You cancelled the payment on PayPal</p>
              </div>
              <div className="flex items-start bg-green-50 rounded-lg p-4 border border-green-200">
                <ShieldCheckIcon className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-slate-700">No charges were made to your account</p>
              </div>
              <div className="flex items-start bg-purple-50 rounded-lg p-4 border border-purple-200">
                <ShieldCheckIcon className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-slate-700">Your current plan remains active</p>
              </div>
              <div className="flex items-start bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <ShieldCheckIcon className="w-5 h-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-slate-700">You can upgrade anytime</p>
              </div>
            </div>
          </div>

          {/* Why Upgrade */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-8 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Premium Benefits</h3>
            </div>
            <div className="space-y-3">
              {[
                'Unlimited FAQs and chat questions',
                'Advanced analytics and insights',
                'Priority support with faster response',
                'Custom categories and organization',
                'White-label options available',
                'API access for integrations'
              ].map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-slate-700 font-medium">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={onRetry}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center"
          >
            <ArrowPathIcon className="w-6 h-6 mr-2" />
            Try Again
          </button>
          
          <button
            onClick={onBack}
            className="bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300 px-10 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            <ArrowLeftIcon className="w-6 h-6 mr-2" />
            Back to Dashboard
          </button>
        </div>

        {/* Support Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">💬 Need Help?</h3>
            <p className="text-slate-600 mb-6 max-w-xl mx-auto">
              Having trouble with payments? Our support team is here to help you every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@aifaqgenerator.com"
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg"
              >
                📧 Contact Support
              </a>
              <a
                href="/pricing"
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-3 rounded-xl font-semibold transition-all"
              >
                💰 View All Plans
              </a>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="text-center mt-8 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
          <p className="text-lg font-semibold text-slate-900">
            Take your time! Upgrade whenever you're ready to unlock premium features. 🚀
          </p>
        </div>
      </main>
    </div>
  );
};

export default PaymentCancel;
