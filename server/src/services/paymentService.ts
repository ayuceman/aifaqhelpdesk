import { databaseService } from './databaseService';

// PayPal configuration - using direct API calls instead of SDK
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'your-paypal-client-id';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'your-paypal-client-secret';
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

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
      'Up to 10 FAQs',
      '50 chat questions per day',
      '500 total chat questions',
      'Basic support'
    ],
    limits: {
      maxFAQs: 10,
      maxChatQuestionsPerDay: 50,
      maxChatQuestionsTotal: 500
    }
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 9.99,
    interval: 'month',
    features: [
      'Up to 100 FAQs',
      '500 chat questions per day',
      '5,000 total chat questions',
      'Priority support',
      'Analytics dashboard'
    ],
    limits: {
      maxFAQs: 100,
      maxChatQuestionsPerDay: 500,
      maxChatQuestionsTotal: 5000
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 29.99,
    interval: 'month',
    features: [
      'Up to 1,000 FAQs',
      '2,000 chat questions per day',
      '20,000 total chat questions',
      'Priority support',
      'Advanced analytics',
      'Custom categories',
      'Export functionality'
    ],
    limits: {
      maxFAQs: 1000,
      maxChatQuestionsPerDay: 2000,
      maxChatQuestionsTotal: 20000
    },
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99.99,
    interval: 'month',
    features: [
      'Unlimited FAQs',
      'Unlimited chat questions',
      'White-label solution',
      'Dedicated support',
      'Custom integrations',
      'Advanced security',
      'SLA guarantee'
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
        throw new Error(`PayPal API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('PayPal access token error:', error);
      throw new Error('Failed to get PayPal access token');
    }
  }

  async createPaymentIntent(userId: string, planId: string, interval: 'month' | 'year' = 'month') {
    const plan = pricingPlans.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Invalid plan selected');
    }

    // Calculate price based on interval
    let price = plan.price;
    if (interval === 'year') {
      price = plan.price * 12 * 0.8; // 20% discount for yearly
    }

    // Check if PayPal credentials are configured
    if (PAYPAL_CLIENT_ID === 'your-paypal-client-id' || PAYPAL_CLIENT_SECRET === 'your-paypal-client-secret') {
      console.log('PayPal credentials not configured, returning mock payment URL');
      return {
        orderId: `mock-order-${Date.now()}`,
        approvalUrl: `${process.env.CLIENT_URL || 'http://localhost:5175'}/payment/success?mock=true`
      };
    }

    try {
      const accessToken = await this.getPayPalAccessToken();
      
      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: price.toFixed(2)
          },
          description: `${plan.name} Plan - ${interval === 'year' ? 'Yearly' : 'Monthly'} subscription`
        }],
        application_context: {
          brand_name: 'AI FAQ Generator',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.CLIENT_URL || 'http://localhost:5175'}/payment/success`,
          cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5175'}/payment/cancel`
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

      const result = await response.json();
      
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

      const result = await response.json();
      
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
        if (paymentIntent) {
          // Update user plan
          await databaseService.updateUserPlan(paymentIntent.userId, {
            plan: paymentIntent.planId,
            interval: paymentIntent.interval,
            subscriptionId: capture.id,
            subscriptionStatus: 'active',
            subscriptionStartDate: new Date().toISOString(),
            subscriptionEndDate: paymentIntent.interval === 'year' 
              ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          });
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
    if (!user) {
      throw new Error('User not found');
    }

    const plan = pricingPlans.find(p => p.id === user.plan);
    return {
      plan: user.plan,
      interval: user.interval || 'month',
      status: user.subscriptionStatus || 'inactive',
      startDate: user.subscriptionStartDate,
      endDate: user.subscriptionEndDate,
      features: plan?.features || [],
      limits: plan?.limits || pricingPlans[0].limits
    };
  }
}

export const paymentService = new PaymentService();
