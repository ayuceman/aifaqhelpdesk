import express from 'express';
import { paymentService } from '../services/paymentService';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Get pricing plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await paymentService.getPricingPlans();
    res.json({ success: true, plans });
  } catch (error) {
    console.error('Get pricing plans error:', error);
    res.status(500).json({ error: 'Failed to get pricing plans' });
  }
});

// Get user subscription details
router.get('/subscription', authenticateToken, async (req, res) => {
  try {
    const subscription = await paymentService.getUserSubscription(req.user!.id);
    res.json({ success: true, subscription });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription details' });
  }
});

// Create payment intent
router.post('/create-payment', authenticateToken, async (req, res) => {
  try {
    const { planId, interval } = req.body;
    
    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    const paymentIntent = await paymentService.createPaymentIntent(
      req.user!.id,
      planId,
      interval || 'month'
    );

    res.json({ 
      success: true, 
      orderId: paymentIntent.orderId,
      approvalUrl: paymentIntent.approvalUrl
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Capture payment (called after PayPal approval)
router.post('/capture-payment', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const result = await paymentService.capturePayment(orderId);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Capture payment error:', error);
    res.status(500).json({ error: 'Failed to capture payment' });
  }
});

// Cancel subscription
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const result = await paymentService.cancelSubscription(req.user!.id);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

export default router;
