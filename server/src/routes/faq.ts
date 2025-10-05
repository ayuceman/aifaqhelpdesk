import express from 'express';
import { faqService } from '../services/faqService';
import { databaseService } from '../services/databaseService';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Get all FAQs for a project
router.get('/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if user owns this project
    const project = databaseService.getProjectById(projectId);
    if (!project || project.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const faqs = await faqService.getFAQs(projectId);
    res.json({ success: true, faqs });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ error: 'Failed to get FAQs' });
  }
});

// Create new FAQ
router.post('/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { question, answer } = req.body;
    
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    // Check if user owns this project
    const project = databaseService.getProjectById(projectId);
    if (!project || project.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const faq = await faqService.createFAQ(projectId, question, answer);
    res.json({ success: true, faq });
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({ error: 'Failed to create FAQ' });
  }
});

// Update FAQ
router.put('/:projectId/:faqId', authenticateToken, async (req, res) => {
  try {
    const { projectId, faqId } = req.params;
    const { question, answer } = req.body;
    
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    // Check if user owns this project
    const project = databaseService.getProjectById(projectId);
    if (!project || project.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const faq = await faqService.updateFAQ(faqId, question, answer);
    res.json({ success: true, faq });
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
});

// Delete FAQ
router.delete('/:projectId/:faqId', authenticateToken, async (req, res) => {
  try {
    const { projectId, faqId } = req.params;

    // Check if user owns this project
    const project = databaseService.getProjectById(projectId);
    if (!project || project.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await faqService.deleteFAQ(faqId);
    res.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
});

// Bulk save FAQs (for generated FAQs)
router.post('/:projectId/bulk', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { faqs } = req.body;
    
    if (!Array.isArray(faqs)) {
      return res.status(400).json({ error: 'FAQs must be an array' });
    }

    // Check if user owns this project
    const project = databaseService.getProjectById(projectId);
    if (!project || project.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const savedFAQs = await faqService.bulkCreateFAQs(projectId, faqs);
    res.json({ success: true, faqs: savedFAQs });
  } catch (error) {
    console.error('Bulk save FAQs error:', error);
    res.status(500).json({ error: 'Failed to save FAQs' });
  }
});

// Build embeddings for project
router.post('/:projectId/build-embeddings', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if user owns this project
    const project = databaseService.getProjectById(projectId);
    if (!project || project.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    console.log(`Building embeddings for project: ${projectId}`);
    
    const result = await faqService.buildEmbeddings(projectId);
    
    console.log(`✅ Embeddings built: ${result.successCount} success, ${result.errorCount} errors`);
    
    res.json({ 
      success: true, 
      message: `Built embeddings for ${result.successCount} FAQs`, 
      count: result.successCount,
      errors: result.errorCount
    });
  } catch (error) {
    console.error('Build embeddings error:', error);
    res.status(500).json({ error: 'Failed to build embeddings' });
  }
});

// Get trial status for a project
router.get('/:projectId/trial-status', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if user owns this project
    const project = databaseService.getProjectById(projectId);
    if (!project || project.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get user info
    const user = databaseService.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get project usage
    const usage = databaseService.getProjectUsage(projectId);
    
    // Determine plan limits based on user plan
    let limits;
    if (user.plan === 'free') {
      limits = {
        maxFAQs: 100,
        maxChatQuestionsPerDay: 50,
        maxChatQuestionsTotal: 500,
        trialDays: 0
      };
    } else if (user.plan === 'trial') {
      limits = {
        maxFAQs: 50,
        maxChatQuestionsPerDay: 100,
        maxChatQuestionsTotal: 1000,
        trialDays: 14
      };
    } else {
      // Paid plans - much higher limits
      limits = {
        maxFAQs: 10000,
        maxChatQuestionsPerDay: 1000,
        maxChatQuestionsTotal: 100000,
        trialDays: 0
      };
    }

    const now = new Date();
    const trialEndDate = user.trial_end_date ? new Date(user.trial_end_date) : null;
    const daysRemaining = trialEndDate ? Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 999;
    const isExpired = trialEndDate ? now > trialEndDate : false;
    
    const faqCount = usage?.faq_count || 0;
    const chatCount = usage?.chat_count || 0;
    const dailyChatCount = usage?.daily_chat_count || 0;
    
    const isOverLimit = faqCount >= limits.maxFAQs || 
                       chatCount >= limits.maxChatQuestionsTotal ||
                       dailyChatCount >= limits.maxChatQuestionsPerDay;

    const trialStatus = {
      isActive: user.plan !== 'trial' || (!isExpired && !isOverLimit),
      daysRemaining: user.plan === 'free' ? 999 : daysRemaining,
      faqCount,
      chatCount,
      dailyChatCount,
      limits,
      isExpired,
      isOverLimit,
      plan: user.plan
    };

    res.json({ success: true, trialStatus });
  } catch (error) {
    console.error('Get trial status error:', error);
    res.status(500).json({ error: 'Failed to get trial status' });
  }
});

export { router as faqRoutes };