import express from 'express';
import { storageService } from '../services/storageService';
import { llmService } from '../services/llmService';

const router = express.Router();

// Get all FAQs (with project support)
router.get('/', async (req, res) => {
  try {
    const project = (req.query.project as string) || 'default';
    const faqs = await storageService.getFAQs(project);
    res.json({ success: true, faqs, project });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ error: 'Failed to get FAQs' });
  }
});

// Create new FAQ (with project support)
router.post('/', async (req, res) => {
  try {
    const { question, answer, project = 'default' } = req.body;
    
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    const faq = await storageService.addFAQ(question, answer, project);
    
    // Generate embedding for the FAQ
    const combinedText = `${question} ${answer}`;
    const embeddingResponse = await llmService.generateEmbedding(combinedText);
    await storageService.addEmbedding(combinedText, embeddingResponse.embedding, faq.id, project);

    res.json({ success: true, faq });
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({ error: 'Failed to create FAQ' });
  }
});

// Update FAQ (with project support)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, project = 'default' } = req.body;
    
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    const faq = await storageService.updateFAQ(id, question, answer, project);
    
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    // Update embedding
    const combinedText = `${question} ${answer}`;
    const embeddingResponse = await llmService.generateEmbedding(combinedText);
    
    // Remove old embeddings and add new one
    await storageService.removeEmbeddingsByFAQId(id, project);
    await storageService.addEmbedding(combinedText, embeddingResponse.embedding, id, project);

    res.json({ success: true, faq });
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
});

// Delete FAQ (with project support)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = (req.query.project as string) || 'default';
    
    const success = await storageService.deleteFAQ(id, project);
    
    if (!success) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
});

// Bulk save FAQs (for generated FAQs) with project support
router.post('/bulk', async (req, res) => {
  try {
    const { faqs, project = 'default' } = req.body;
    
    if (!Array.isArray(faqs)) {
      return res.status(400).json({ error: 'FAQs must be an array' });
    }

    const savedFAQs = [];
    
    for (const faqData of faqs) {
      if (!faqData.question || !faqData.answer) {
        continue; // Skip invalid FAQs
      }

      const faq = await storageService.addFAQ(faqData.question, faqData.answer, project);
      
      // Generate embedding
      const combinedText = `${faq.question} ${faq.answer}`;
      const embeddingResponse = await llmService.generateEmbedding(combinedText);
      await storageService.addEmbedding(combinedText, embeddingResponse.embedding, faq.id, project);
      
      savedFAQs.push(faq);
    }

    res.json({ success: true, faqs: savedFAQs, project });
  } catch (error) {
    console.error('Bulk save FAQs error:', error);
    res.status(500).json({ error: 'Failed to save FAQs' });
  }
});

// List all projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await storageService.listProjects();
    res.json({ success: true, projects });
  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json({ error: 'Failed to list projects' });
  }
});

export { router as faqRoutes };
