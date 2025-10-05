import { Request, Response, NextFunction } from 'express';
import { trialService } from '../services/trialService';

export const checkTrialLimits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = req.query.project as string || req.body.project || 'default';
    
    // Initialize trial if it doesn't exist
    await trialService.initializeTrial(project);
    
    const status = await trialService.getTrialStatus(project);
    
    // Add trial status to request
    (req as any).trialStatus = status;
    
    // Check if trial is expired or over limit
    if (status.isExpired) {
      return res.status(402).json({
        error: 'Trial expired',
        message: 'Your 14-day trial has expired. Please upgrade to continue using the service.',
        trialStatus: status,
        upgradeUrl: '/upgrade'
      });
    }
    
    if (status.isOverLimit) {
      return res.status(402).json({
        error: 'Trial limit exceeded',
        message: 'You have reached your trial limits. Please upgrade to continue using the service.',
        trialStatus: status,
        upgradeUrl: '/upgrade'
      });
    }
    
    next();
  } catch (error) {
    console.error('Trial middleware error:', error);
    next();
  }
};

export const checkFAQLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = req.query.project as string || req.body.project || 'default';
    const status = await trialService.getTrialStatus(project);
    
    if (status.faqCount >= status.limits.maxFAQs) {
      return res.status(402).json({
        error: 'FAQ limit exceeded',
        message: `You have reached the maximum of ${status.limits.maxFAQs} FAQs for your trial. Please upgrade to add more FAQs.`,
        trialStatus: status,
        upgradeUrl: '/upgrade'
      });
    }
    
    next();
  } catch (error) {
    console.error('FAQ limit middleware error:', error);
    next();
  }
};

export const checkChatLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = req.query.project as string || req.body.project || 'default';
    const status = await trialService.getTrialStatus(project);
    
    if (status.chatCount >= status.limits.maxChatQuestionsTotal) {
      return res.status(402).json({
        error: 'Chat limit exceeded',
        message: `You have reached the maximum of ${status.limits.maxChatQuestionsTotal} chat questions for your trial. Please upgrade to continue chatting.`,
        trialStatus: status,
        upgradeUrl: '/upgrade'
      });
    }
    
    if (status.dailyChatCount >= status.limits.maxChatQuestionsPerDay) {
      return res.status(402).json({
        error: 'Daily chat limit exceeded',
        message: `You have reached the daily limit of ${status.limits.maxChatQuestionsPerDay} chat questions. Please try again tomorrow or upgrade for unlimited access.`,
        trialStatus: status,
        upgradeUrl: '/upgrade'
      });
    }
    
    next();
  } catch (error) {
    console.error('Chat limit middleware error:', error);
    next();
  }
};
