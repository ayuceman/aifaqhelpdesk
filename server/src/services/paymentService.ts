import { paypal } from '@paypal/paypal-server-sdk';
import { databaseService } from './databaseService';

// PayPal configuration
const paypalClient = new paypal.PayPalHttpClient({
  clientId: process.env.PAYPAL_CLIENT_ID!,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
  environment: process.env.NODE_ENV === 'production' 
    ? paypal.Environment.Live 
    : paypal.Environment.Sandbox
});

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

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
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
        return_url: `${process.env.CLIENT_URL}/payment/success`,
        cancel_url: `${process.env.CLIENT_URL}/payment/cancel`
      }
    });

    try {
      const response = await paypalClient.execute(request);
      const orderId = response.result.id;

      // Store payment intent in database
      await databaseService.createPaymentIntent({
        id: orderId,
        userId,
        planId,
        interval,
        amount: price,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      return {
        orderId,
        approvalUrl: response.result.links.find(link => link.rel === 'approve')?.href
      };
    } catch (error) {
      console.error('PayPal payment creation error:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  async capturePayment(orderId: string) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
      const response = await paypalClient.execute(request);
      const capture = response.result.purchase_units[0].payments.captures[0];

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
