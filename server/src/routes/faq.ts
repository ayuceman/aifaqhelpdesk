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

export { router as faqRoutes };