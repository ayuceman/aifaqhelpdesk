import React from 'react';

interface PaymentCancelProps {
  onBack: () => void;
  onRetry: () => void;
}

const PaymentCancel: React.FC<PaymentCancelProps> = ({ onBack, onRetry }) => {
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
              <h1 className="text-xl font-bold text-slate-900">Payment Cancelled</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Cancel Icon */}
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Payment Cancelled
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Your payment was cancelled. No charges have been made to your account.
          </p>

          {/* Information Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">What happened?</h3>
            <div className="text-left space-y-3 text-slate-600">
              <p>• You cancelled the payment process</p>
              <p>• No charges were made to your account</p>
              <p>• Your current plan remains unchanged</p>
              <p>• You can try upgrading again anytime</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onRetry}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onBack}
              className="bg-white text-slate-600 border border-slate-300 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>

          <p className="text-sm text-slate-500 mt-6">
            Need help? Contact our support team for assistance.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PaymentCancel;
