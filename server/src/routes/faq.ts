import express from 'express';
import { faqService } from '../services/faqService';
import { databaseService } from '../services/databaseService';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Get all FAQs for a project with advanced filtering and pagination
router.get('/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as string || 'created_at';
    const sortOrder = req.query.sortOrder as string || 'desc';
    const category = req.query.category as string;
    
    // Check if user owns this project
    const project = databaseService.getProjectById(projectId);
    if (!project || project.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ 
        error: 'Invalid pagination parameters. Page must be >= 1, limit must be 1-100' 
      });
    }

    // Validate sort parameters
    const allowedSortFields = ['created_at', 'updated_at', 'question', 'answer', 'view_count'];
    const allowedSortOrders = ['asc', 'desc'];
    
    if (!allowedSortFields.includes(sortBy)) {
      return res.status(400).json({ 
        error: `Invalid sortBy field. Allowed: ${allowedSortFields.join(', ')}` 
      });
    }
    
    if (!allowedSortOrders.includes(sortOrder)) {
      return res.status(400).json({ 
        error: `Invalid sortOrder. Allowed: ${allowedSortOrders.join(', ')}` 
      });
    }

    const result = await faqService.getFAQsWithPagination(projectId, {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      category
    });

    res.json({ 
      success: true, 
      faqs: result.faqs,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
        hasNext: page < Math.ceil(result.total / limit),
        hasPrev: page > 1
      },
      filters: {
        search,
        sortBy,
        sortOrder,
        category
      },
      metadata: {
        projectId,
        timestamp: new Date().toISOString()
      }
    });
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

// Bulk operations for FAQs
router.post('/:projectId/bulk-operations', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { operation, faqIds, data } = req.body;
    
    // Check if user owns this project
    const project = databaseService.getProjectById(projectId);
    if (!project || project.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!operation || !Array.isArray(faqIds) || faqIds.length === 0) {
      return res.status(400).json({ 
        error: 'Operation, faqIds array, and data are required' 
      });
    }

    const allowedOperations = ['delete', 'update', 'categorize', 'export'];
    if (!allowedOperations.includes(operation)) {
      return res.status(400).json({ 
        error: `Invalid operation. Allowed: ${allowedOperations.join(', ')}` 
      });
    }

    const result = await faqService.bulkOperation(projectId, operation, faqIds, data);
    
    res.json({ 
      success: true, 
      operation,
      processed: result.processed,
      failed: result.failed,
      errors: result.errors
    });
  } catch (error) {
    console.error('Bulk operation error:', error);
    res.status(500).json({ error: 'Failed to perform bulk operation' });
  }
});

// Get FAQ analytics for a project
router.get('/:projectId/analytics', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const period = req.query.period as string || '30d'; // 7d, 30d, 90d, 1y
    
    // Check if user owns this project
    const project = databaseService.getProjectById(projectId);
    if (!project || project.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const analytics = await faqService.getFAQsAnalytics(projectId, period);
    
    res.json({ 
      success: true, 
      analytics,
      period,
      projectId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get FAQ analytics error:', error);
    res.status(500).json({ error: 'Failed to get FAQ analytics' });
  }
});

// Search FAQs with advanced filters
router.get('/:projectId/search', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const query = req.query.q as string;
    const filters = req.query.filters as string; // JSON string of filters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Search query must be at least 2 characters long' 
      });
    }

    // Check if user owns this project
    const project = databaseService.getProjectById(projectId);
    if (!project || project.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await faqService.searchFAQs(projectId, {
      query: query.trim(),
      filters: filters ? JSON.parse(filters) : {},
      page,
      limit
    });
    
    res.json({ 
      success: true, 
      results: result.faqs,
      total: result.total,
      query,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      }
    });
  } catch (error) {
    console.error('Search FAQs error:', error);
    res.status(500).json({ error: 'Failed to search FAQs' });
  }
});

// Export FAQs in various formats
router.get('/:projectId/export', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const format = req.query.format as string || 'json'; // json, csv, pdf
    const category = req.query.category as string;
    
    // Check if user owns this project
    const project = databaseService.getProjectById(projectId);
    if (!project || project.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const allowedFormats = ['json', 'csv', 'pdf'];
    if (!allowedFormats.includes(format)) {
      return res.status(400).json({ 
        error: `Invalid format. Allowed: ${allowedFormats.join(', ')}` 
      });
    }

    const exportData = await faqService.exportFAQs(projectId, format, category);
    
    res.setHeader('Content-Type', exportData.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="faqs-${project.slug}-${Date.now()}.${format}"`);
    res.send(exportData.data);
  } catch (error) {
    console.error('Export FAQs error:', error);
    res.status(500).json({ error: 'Failed to export FAQs' });
  }
});

// Get FAQ categories for a project
router.get('/:projectId/categories', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if user owns this project
    const project = databaseService.getProjectById(projectId);
    if (!project || project.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const categories = await faqService.getFAQsCategories(projectId);
    
    res.json({ 
      success: true, 
      categories,
      projectId
    });
  } catch (error) {
    console.error('Get FAQ categories error:', error);
    res.status(500).json({ error: 'Failed to get FAQ categories' });
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