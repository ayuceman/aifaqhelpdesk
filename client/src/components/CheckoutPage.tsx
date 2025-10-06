import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from './DashboardLayout';
import { ShieldCheckIcon, CheckCircleIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './Toast';

// Declare PayPal types for TypeScript
declare global {
  interface Window {
    paypal?: any;
  }
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
}

interface CheckoutPageProps {
  plan: PricingPlan;
  interval: 'month' | 'year';
  onBack: () => void;
  onPaymentSuccess: () => void;
  onPaymentCancel: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({
  plan,
  interval,
  onBack,
  onPaymentSuccess,
  onPaymentCancel
}) => {
  const [, setIsProcessing] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);
  const { success, error, toasts, removeToast } = useToast();

  const price = interval === 'year' ? plan.price * 12 * 0.8 : plan.price;
  const savings = interval === 'year' ? plan.price * 12 * 0.2 : 0;

  // Load PayPal SDK
  useEffect(() => {
    const loadPayPalSDK = () => {
      if (window.paypal) {
        setPaypalLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=AeRf10ifzd8JVqLFd58rBo2cclgoeRsJ0fWYkqJhnYER7kvTtXznb_6SffvsJtZbKr3elNij829RkIT4&currency=USD&intent=capture&components=buttons`;
      script.async = true;
      script.onload = () => {
        setPaypalLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load PayPal SDK');
      };
      document.body.appendChild(script);
    };

    loadPayPalSDK();
  }, []);

  // Render PayPal buttons when SDK is loaded
  useEffect(() => {
    if (paypalLoaded && window.paypal && paypalRef.current) {
      window.paypal.Buttons({
        style: {
          color: 'blue',
          shape: 'rect',
          label: 'pay',
          height: 50,
          layout: 'vertical'
        },
        createOrder: async (_data: any, _actions: any) => {
          try {
            setIsProcessing(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/payment/create-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                planId: plan.id,
                interval
              })
            });

            const result = await response.json();
            
            if (result.success && result.paypalOrderId) {
              return result.paypalOrderId;
            } else {
              throw new Error(result.error || 'Failed to create PayPal order');
            }
          } catch (error) {
            console.error('Error creating PayPal order:', error);
            throw error;
          } finally {
            setIsProcessing(false);
          }
        },
        onApprove: async (_data: any, _actions: any) => {
          try {
            setIsProcessing(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/payment/capture-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                orderId: _data.orderID,
                planId: plan.id,
                interval
              })
            });

            const result = await response.json();
            
            if (result.success) {
              success('Payment successful! Your subscription is now active.');
              onPaymentSuccess();
            } else {
              throw new Error(result.error || 'Payment capture failed');
            }
          } catch (error) {
            console.error('Error capturing payment:', error);
            onPaymentCancel();
          } finally {
            setIsProcessing(false);
          }
        },
        onError: (err: any) => {
          console.error('PayPal error:', err);
          setIsProcessing(false);
          error('Payment failed. Please try again.');
        },
        onCancel: () => {
          console.log('PayPal payment cancelled');
          setIsProcessing(false);
          success('Payment cancelled. You can try again when ready.');
        }
      }).render(paypalRef.current);
    }
  }, [paypalLoaded, plan.id, interval, onPaymentSuccess, onPaymentCancel]);

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Secure Checkout</h1>
              <p className="text-slate-600 text-sm mt-1">Complete your subscription</p>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-slate-700">SSL Secured</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            {/* Plan Details Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Order Summary</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <span className="text-slate-600">Selected Plan</span>
                  <span className="text-xl font-bold text-slate-900">{plan.name}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Billing Cycle</span>
                  <span className="font-semibold text-slate-900 capitalize">
                    {interval === 'year' ? 'Annually' : 'Monthly'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Base Price</span>
                  <span className="font-semibold text-slate-900">${plan.price.toFixed(2)}/mo</span>
                </div>
                
                {interval === 'year' && (
                  <>
                    <div className="flex items-center justify-between text-green-600">
                      <span className="flex items-center">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Annual Discount (20%)
                      </span>
                      <span className="font-semibold">-${savings.toFixed(2)}</span>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-700 text-center font-medium">
                        💰 You're saving ${savings.toFixed(2)} with yearly billing!
                      </p>
                    </div>
                  </>
                )}
                
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border-2 border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-slate-900">Total Today</span>
                    <span className="text-3xl font-bold text-blue-600">${price.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    {interval === 'year' ? 'Billed annually' : 'Billed monthly'}
                  </p>
                </div>
              </div>
            </div>

            {/* Features Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
                What's Included
              </h3>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust Badges */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-6">
              <h4 className="text-sm font-bold text-slate-900 mb-4 text-center">Why Choose Us?</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <ShieldCheckIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">SSL Secured</p>
                </div>
                <div>
                  <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">GDPR Compliant</p>
                </div>
                <div>
                  <CreditCardIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">Secure Payment</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Payment Method</h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* PayPal Security Notice */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.44-.66c-.84-1.01-2.24-1.41-3.73-1.41H8.5c-.524 0-.968.382-1.05.9L5.3 19.106h4.6c.524 0 .968-.382 1.05-.9l1.12-7.106h2.19c.524 0 .968-.382 1.05-.9l1.12-7.106h2.19c.524 0 .968-.382 1.05-.9l1.12-7.106z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-blue-900">Secured by PayPal</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Your payment is processed securely through PayPal. We never store your card details.
                      </p>
                      <div className="flex items-center mt-2 space-x-4 text-xs text-blue-700 font-medium">
                        <span className="flex items-center">
                          <ShieldCheckIcon className="w-4 h-4 mr-1" />
                          Encrypted
                        </span>
                        <span className="flex items-center">
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Protected
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Summary */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-slate-600">{plan.name} Plan</span>
                    <span className="font-semibold text-slate-900">${plan.price}/mo</span>
                  </div>
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-slate-600">Billing</span>
                    <span className="font-semibold text-slate-900 capitalize">{interval}ly</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between items-center mb-2 text-sm text-green-600">
                      <span>Savings</span>
                      <span className="font-semibold">-${savings.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-300">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">${price.toFixed(2)}</span>
                  </div>
                </div>

                {/* PayPal Buttons */}
                <div className="space-y-4">
                  {!paypalLoaded ? (
                    <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
                      <span className="text-slate-600 font-medium">Loading secure payment...</span>
                    </div>
                  ) : (
                    <div ref={paypalRef} className="w-full"></div>
                  )}
                  
                  <p className="text-xs text-center text-slate-500">
                    🔒 256-bit SSL encryption • Your data is safe with us
                  </p>
                  
                  <button
                    type="button"
                    onClick={onBack}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-6 rounded-xl font-semibold transition-all"
                  >
                    ← Back to Plans
                  </button>
                </div>
              </div>
            </div>

            {/* Money Back Guarantee */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircleIcon className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">30-Day Money-Back Guarantee</h4>
                <p className="text-sm text-slate-700">
                  Not satisfied? Get a full refund within 30 days, no questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </DashboardLayout>
  );
};

export default CheckoutPage;
