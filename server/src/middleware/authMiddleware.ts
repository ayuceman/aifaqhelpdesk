import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        plan: string;
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const payload = authService.verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get user details
    const user = await authService.getUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Add user to request
    req.user = {
      id: user.id,
      email: user.email,
      plan: user.plan
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const payload = authService.verifyToken(token);
      if (payload) {
        const user = await authService.getUserById(payload.userId);
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            plan: user.plan
          };
        }
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

export const requirePlan = (requiredPlan: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const planHierarchy = ['free', 'trial', 'starter', 'professional', 'enterprise'];
    const userPlanIndex = planHierarchy.indexOf(req.user.plan);
    const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);

    if (userPlanIndex < requiredPlanIndex) {
      return res.status(403).json({ 
        error: 'Insufficient plan level',
        message: `This feature requires ${requiredPlan} plan or higher`,
        currentPlan: req.user.plan,
        requiredPlan
      });
    }

    next();
  };
};
