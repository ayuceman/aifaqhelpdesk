import React, { useEffect, useState } from 'react';
import { XCircleIcon, ArrowLeftIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface PaymentCancelProps {
  onBack: () => void;
  onRetry: () => void;
}

const PaymentCancel: React.FC<PaymentCancelProps> = ({ onBack, onRetry }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get error from URL parameters
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button onClick={onBack} className="text-slate-600 hover:text-slate-900 transition-colors">
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-slate-900">Payment Cancelled</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          {/* Cancel Icon */}
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-8 shadow-lg">
            <XCircleIcon className="w-12 h-12 text-white" />
          </div>

          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Payment Cancelled
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Your payment was cancelled and no charges have been made to your account. You can try upgrading again anytime.
          </p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 max-w-md mx-auto">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 mb-1">Error Details</h3>
                  <p className="text-sm text-red-600">{getErrorMessage(error)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* What Happened */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              What Happened?
            </h3>
            <div className="space-y-4 text-slate-600">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>You cancelled the payment process on PayPal</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>No charges were made to your account</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Your current plan remains unchanged</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>You can try upgrading again anytime</p>
              </div>
            </div>
          </div>

          {/* Why Upgrade */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              Why Upgrade?
            </h3>
            <div className="space-y-4 text-slate-600">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Unlimited FAQs and chat questions</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Advanced analytics and insights</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Priority support and faster processing</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Custom categories and advanced features</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={onRetry}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Try Again
          </button>
          
          <button
            onClick={onBack}
            className="bg-white text-slate-600 border-2 border-slate-300 px-8 py-4 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
        </div>

        {/* Support Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-8 shadow-lg">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Need Help?</h3>
            <p className="text-slate-600 mb-6">
              If you're experiencing issues with the payment process, our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@aifaqgenerator.com"
                className="bg-slate-100 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                📧 Contact Support
              </a>
              <a
                href="/pricing"
                className="bg-blue-100 text-blue-700 px-6 py-3 rounded-lg font-medium hover:bg-blue-200 transition-colors"
              >
                💰 View Pricing
              </a>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="text-center mt-8">
          <p className="text-slate-500">
            No worries! You can upgrade anytime when you're ready. 🚀
          </p>
        </div>
      </main>
    </div>
  );
};

export default PaymentCancel;