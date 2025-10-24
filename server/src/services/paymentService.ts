import { databaseService } from './databaseService';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config({ path: './.env' });

// PayPal configuration - do NOT hardcode credentials here. Provide via environment variables or a secrets manager.
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api.sandbox.paypal.com';

// Log only presence of credentials (never log secret values)
console.log('PayPal service initialized. NODE_ENV:', process.env.NODE_ENV);
console.log('PAYPAL_CLIENT_ID set:', !!PAYPAL_CLIENT_ID);
console.log('PAYPAL_CLIENT_SECRET set:', !!PAYPAL_CLIENT_SECRET);

export interface PricingPlan {
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

export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      'Up to 50 FAQs',
      '100 chat questions per month',
      'Basic analytics',
      'Community support',
      '1 project'
    ],
    limits: {
      maxFAQs: 50,
      maxChatQuestionsPerDay: 10,
      maxChatQuestionsTotal: 100
    }
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 15,
    interval: 'month',
    features: [
      'Up to 500 FAQs',
      '1,000 chat questions per month',
      'Basic analytics dashboard',
      'Email support',
      'Up to 3 projects',
      'Mobile responsive widget',
      'Custom branding'
    ],
    limits: {
      maxFAQs: 500,
      maxChatQuestionsPerDay: 50,
      maxChatQuestionsTotal: 1000
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 39,
    interval: 'month',
    features: [
      'Up to 2,500 FAQs',
      '5,000 chat questions per month',
      'Advanced analytics & insights',
      'Priority email support',
      'Up to 10 projects',
      'API access',
      'Advanced customization',
      'Remove branding',
      'Export functionality'
    ],
    limits: {
      maxFAQs: 2500,
      maxChatQuestionsPerDay: 200,
      maxChatQuestionsTotal: 5000
    },
    popular: true
  },
  {
    id: 'business',
    name: 'Business',
    price: 79,
    interval: 'month',
    features: [
      'Up to 10,000 FAQs',
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
    limits: {
      maxFAQs: 10000,
      maxChatQuestionsPerDay: 500,
      maxChatQuestionsTotal: 15000
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    interval: 'month',
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
    limits: {
      maxFAQs: -1, // Unlimited
      maxChatQuestionsPerDay: -1, // Unlimited
      maxChatQuestionsTotal: -1 // Unlimited
    }
  }
];

export class PaymentService {
  private async getPayPalAccessToken() {
    try {
      const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en_US',
          'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('PayPal API error:', response.status, response.statusText, errorText);
        throw new Error(`PayPal API error: ${response.status} ${response.statusText}`);
      }

  const data: any = await response.json();
  return data.access_token;
    } catch (error) {
      console.error('PayPal access token error:', error);
      throw new Error('Failed to get PayPal access token');
    }
  }

  async createPaymentIntent(userId: string, planId: string, interval: 'month' | 'year' = 'month', cardDetails?: any) {
    const plan = pricingPlans.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Invalid plan selected');
    }

    // Calculate price based on interval
    let price = plan.price;
    if (interval === 'year') {
      price = plan.price * 12 * 0.8; // 20% discount for yearly
    }

    // Debug PayPal credentials
    console.log('PayPal Client ID:', PAYPAL_CLIENT_ID ? 'SET' : 'NOT SET');
    console.log('PayPal Client Secret:', PAYPAL_CLIENT_SECRET ? 'SET' : 'NOT SET');
    console.log('PayPal Base URL:', PAYPAL_BASE_URL);
    console.log('Client ID value:', PAYPAL_CLIENT_ID);
    console.log('Client Secret value:', PAYPAL_CLIENT_SECRET);
    
    // Validate PayPal credentials
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET || 
        PAYPAL_CLIENT_ID === 'your-paypal-client-id' || 
        PAYPAL_CLIENT_SECRET === 'your-paypal-client-secret') {
      console.log('PayPal validation failed - credentials not properly configured');
      throw new Error('PayPal credentials not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables.');
    }
    
    console.log('PayPal credentials validated successfully');

    try {
      const accessToken = await this.getPayPalAccessToken();
      
      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: price.toFixed(2)
          },
          description: `${plan.name} Plan - ${interval === 'year' ? 'Yearly' : 'Monthly'} subscription`,
          custom_id: `user_${userId}_plan_${planId}_${interval}`,
          soft_descriptor: 'AI FAQ Generator'
        }],
        application_context: {
          brand_name: 'AI FAQ Generator',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `http://localhost:3001/api/payment/success`,
          cancel_url: `http://localhost:3001/api/payment/cancel`
        }
      };

      const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': Math.random().toString(36).substring(2, 15)
        },
        body: JSON.stringify(orderData)
      });

  const result: any = await response.json();
      
      if (result.id) {
        // Store payment intent in database
        await databaseService.createPaymentIntent({
          id: result.id,
          userId,
          planId,
          interval,
          amount: price,
          status: 'pending',
          createdAt: new Date().toISOString()
        });

        const approvalUrl = result.links.find((link: any) => link.rel === 'approve')?.href;
        
        return {
          orderId: result.id,
          approvalUrl
        };
      } else {
        throw new Error('Failed to create PayPal order');
      }
    } catch (error) {
      console.error('PayPal payment creation error:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  async processDirectPayment(userId: string, planId: string, interval: 'month' | 'year', cardDetails: any) {
    const plan = pricingPlans.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Invalid plan selected');
    }

    // Calculate price based on interval
    let price = plan.price;
    if (interval === 'year') {
      price = plan.price * 12 * 0.8; // 20% discount for yearly
    }

    try {
      console.log('Creating PayPal standard payment for:', {
        userId,
        planId,
        interval,
        amount: price
      });

      const accessToken = await this.getPayPalAccessToken();
      
      // Create PayPal order using standard flow
      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: price.toFixed(2)
          },
          description: `${plan.name} Plan - ${interval === 'year' ? 'Yearly' : 'Monthly'} subscription`,
          custom_id: `user_${userId}_plan_${planId}_${interval}`,
          soft_descriptor: 'AI FAQ Generator'
        }],
        application_context: {
          brand_name: 'AI FAQ Generator',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `http://localhost:3001/api/payment/success`,
          cancel_url: `http://localhost:3001/api/payment/cancel`
        }
      };

      const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': Math.random().toString(36).substring(2, 15)
        },
        body: JSON.stringify(orderData)
      });

  const result: any = await response.json();
      console.log('PayPal order creation response:', result);
      
      if (result.id) {
        // Store payment intent in database
        await databaseService.createPaymentIntent({
          id: result.id,
          userId,
          planId,
          interval,
          amount: price,
          status: 'pending',
          createdAt: new Date().toISOString()
        });

        const approvalUrl = result.links.find((link: any) => link.rel === 'approve')?.href;
        
        return {
          success: true,
          orderId: result.id,
          approvalUrl,
          message: 'Redirect to PayPal for payment'
        };
      } else {
        throw new Error('Failed to create PayPal order');
      }
    } catch (error) {
      console.error('PayPal payment creation error:', error);
      throw new Error('Failed to process payment');
    }
  }

  private getCardType(cardNumber: string): string {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    if (number.startsWith('6')) return 'discover';
    return 'visa'; // default
  }

  async capturePayment(orderId: string) {
    try {
      const accessToken = await this.getPayPalAccessToken();
      
      const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': Math.random().toString(36).substring(2, 15)
        },
        body: JSON.stringify({})
      });

  const result: any = await response.json();
      
      if (result.status === 'COMPLETED') {
        const capture = result.purchase_units[0].payments.captures[0];

        // Update payment intent status
        await databaseService.updatePaymentIntent(orderId, {
          status: 'completed',
          transactionId: capture.id,
          completedAt: new Date().toISOString()
        });

        // Get payment intent details
        const paymentIntent = await databaseService.getPaymentIntent(orderId);
        console.log('Payment intent found:', paymentIntent);
        
        if (paymentIntent) {
          console.log('Updating user plan for user:', paymentIntent.userId, 'to plan:', paymentIntent.planId);
          
          // Update user plan
          const updateResult = await databaseService.updateUserPlan(paymentIntent.userId, {
            plan: paymentIntent.planId,
            interval: paymentIntent.interval,
            subscriptionId: capture.id,
            subscriptionStatus: 'active',
            subscriptionStartDate: new Date().toISOString(),
            subscriptionEndDate: paymentIntent.interval === 'year' 
              ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          });
          
          console.log('User plan update result:', updateResult);
        } else {
          console.error('No payment intent found for orderId:', orderId);
        }

        return {
          success: true,
          transactionId: capture.id,
          amount: capture.amount.value
        };
      } else {
        throw new Error('Payment capture failed');
      }
    } catch (error) {
      console.error('PayPal payment capture error:', error);
      throw new Error('Failed to capture payment');
    }
  }

  async cancelSubscription(userId: string) {
    const user = await databaseService.getUserById(userId);
    if (!user || !user.subscriptionId) {
      throw new Error('No active subscription found');
    }

    // In a real implementation, you would call PayPal's subscription cancellation API
    // For now, we'll just update the database
    await databaseService.updateUserPlan(userId, {
      subscriptionStatus: 'cancelled',
      subscriptionEndDate: new Date().toISOString()
    });

    return { success: true };
  }

  async getPricingPlans() {
    return pricingPlans;
  }

  async getUserSubscription(userId: string) {
    const user = await databaseService.getUserById(userId);
    console.log('User data from database:', user);
    
    if (!user) {
      throw new Error('User not found');
    }

    const plan = pricingPlans.find(p => p.id === user.plan);
    const subscription = {
      plan: user.plan,
      interval: user.interval || 'month',
      status: user.subscription_status || 'inactive',
      startDate: user.subscription_start_date,
      endDate: user.subscription_end_date,
      features: plan?.features || [],
      limits: plan?.limits || pricingPlans[0].limits
    };
    
    console.log('Returning subscription data:', subscription);
    return subscription;
  }
}

export const paymentService = new PaymentService();
