import express from 'express';
import { authService } from '../services/authService';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'Email, password, and name are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        error: 'Please provide a valid email address' 
      });
    }

    const result = await authService.signup({ email, password, name });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Signup failed' 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    const result = await authService.login({ email, password });

    res.json({
      success: true,
      message: 'Login successful',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ 
      error: error instanceof Error ? error.message : 'Login failed' 
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await authService.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
});

// Start trial
router.post('/start-trial', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.body;
    
    // Validate planId
    if (!planId || !['starter', 'professional', 'enterprise'].includes(planId)) {
      return res.status(400).json({ 
        error: 'Invalid plan ID. Must be one of: starter, professional, enterprise' 
      });
    }
    
    await authService.startTrial(req.user!.id, planId);
    
    const user = await authService.getUserById(req.user!.id);
    
    res.json({
      success: true,
      message: 'Trial started successfully',
      user
    });
  } catch (error) {
    console.error('Start trial error:', error);
    res.status(500).json({ error: 'Failed to start trial' });
  }
});

// Update user plan
router.put('/plan', authenticateToken, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!plan || !['free', 'trial', 'starter', 'professional', 'enterprise'].includes(plan)) {
      return res.status(400).json({ 
        error: 'Invalid plan. Must be one of: free, trial, starter, professional, enterprise' 
      });
    }

    await authService.updateUserPlan(req.user!.id, plan);
    
    const user = await authService.getUserById(req.user!.id);
    
    res.json({
      success: true,
      message: 'Plan updated successfully',
      user
    });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

export { router as authRoutes };
