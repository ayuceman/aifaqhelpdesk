import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);

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
          height: 45,
          layout: 'vertical'
        },
        createOrder: async (data: any, actions: any) => {
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
        onApprove: async (data: any, actions: any) => {
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
                orderId: data.orderID,
                planId: plan.id,
                interval
              })
            });

            const result = await response.json();
            
            if (result.success) {
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
          onPaymentCancel();
        },
        onCancel: () => {
          console.log('PayPal payment cancelled');
          onPaymentCancel();
        }
      }).render(paypalRef.current);
    }
  }, [paypalLoaded, plan.id, interval, onPaymentSuccess, onPaymentCancel]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <button onClick={onBack} className="text-slate-600 hover:text-slate-900">
                  <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold text-slate-900">Checkout</h1>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <span>Secured by</span>
                <div className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-md">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.44-.66c-.84-1.01-2.24-1.41-3.73-1.41H8.5c-.524 0-.968.382-1.05.9L5.3 19.106h4.6c.524 0 .968-.382 1.05-.9l1.12-7.106h2.19c.524 0 .968-.382 1.05-.9l1.12-7.106h2.19c.524 0 .968-.382 1.05-.9l1.12-7.106z"/>
                  </svg>
                  <span className="font-bold text-xs">PayPal</span>
                </div>
              </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Plan:</span>
                  <span className="font-medium">{plan.name}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Billing:</span>
                  <span className="font-medium">{interval === 'year' ? 'Annually' : 'Monthly'}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Price:</span>
                  <span className="font-medium">${plan.price.toFixed(2)}</span>
                </div>
                
                {interval === 'year' && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Annual Discount (20%):</span>
                    <span>-${savings.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span>${price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Features */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">What's Included</h3>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-slate-600">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Payment Information</h2>
              
              {/* PayPal Payment Section */}
              <div className="space-y-6">
                {/* PayPal Security Notice */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.44-.66c-.84-1.01-2.24-1.41-3.73-1.41H8.5c-.524 0-.968.382-1.05.9L5.3 19.106h4.6c.524 0 .968-.382 1.05-.9l1.12-7.106h2.19c.524 0 .968-.382 1.05-.9l1.12-7.106h2.19c.524 0 .968-.382 1.05-.9l1.12-7.106z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-semibold text-blue-800">PayPal Secure Payment</p>
                      <p className="text-sm text-blue-600 mt-1">
                        Your payment information is encrypted and protected by PayPal's security measures.
                      </p>
                      <div className="flex items-center mt-2 space-x-4 text-xs text-blue-700">
                        <span className="flex items-center">
                          <ShieldCheckIcon className="w-4 h-4 mr-1" />
                          SSL Encrypted
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Protected
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">Plan:</span>
                    <span className="font-medium">{plan.name}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">Billing:</span>
                    <span className="font-medium">{interval === 'year' ? 'Annually' : 'Monthly'}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-semibold border-t border-slate-200 pt-2">
                    <span>Total:</span>
                    <span>${price.toFixed(2)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between items-center text-green-600 text-sm mt-1">
                      <span>You save:</span>
                      <span>${savings.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Official PayPal Buttons */}
                <div className="space-y-4">
                  {/* PayPal SDK Container */}
                  <div className="w-full">
                    {!paypalLoaded ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-slate-600">Loading PayPal...</span>
                      </div>
                    ) : (
                      <div ref={paypalRef} className="w-full"></div>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-500 text-center">
                    Secure payment powered by PayPal
                  </p>
                  
                  <button
                    type="button"
                    onClick={onBack}
                    className="w-full bg-slate-100 text-slate-700 py-3 px-6 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                  >
                    Back to Plans
                  </button>
                </div>
              </div>
            </div>

            {/* PayPal Official Trust Indicators */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.44-.66c-.84-1.01-2.24-1.41-3.73-1.41H8.5c-.524 0-.968.382-1.05.9L5.3 19.106h4.6c.524 0 .968-.382 1.05-.9l1.12-7.106h2.19c.524 0 .968-.382 1.05-.9l1.12-7.106h2.19c.524 0 .968-.382 1.05-.9l1.12-7.106z"/>
                  </svg>
                  <span className="text-lg font-bold text-blue-800">PayPal</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center text-blue-700">
                  <ShieldCheckIcon className="w-5 h-5 mr-2" />
                  <span className="font-semibold">SSL Secured</span>
                </div>
                <div className="flex items-center justify-center text-blue-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">Protected</span>
                </div>
                <div className="flex items-center justify-center text-blue-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span className="font-semibold">Money Back</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-xs text-blue-600 text-center">
                  <span className="font-semibold">Your payment is processed securely by PayPal</span>
                  <br />
                  <span className="text-blue-500">Sandbox Environment • 30-day money-back guarantee</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;