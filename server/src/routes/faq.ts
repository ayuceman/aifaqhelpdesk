import express from 'express';
import { storageService } from '../services/storageService';
import { llmService } from '../services/llmService';

const router = express.Router();

// Get all FAQs
router.get('/', async (req, res) => {
  try {
    const faqs = await storageService.getFAQs();
    res.json({ success: true, faqs });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ error: 'Failed to get FAQs' });
  }
});

// Create new FAQ
router.post('/', async (req, res) => {
  try {
    const { question, answer } = req.body;
    
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    const faq = await storageService.addFAQ(question, answer);
    
    // Generate embedding for the FAQ
    const combinedText = `${question} ${answer}`;
    const embeddingResponse = await llmService.generateEmbedding(combinedText);
    await storageService.addEmbedding(combinedText, embeddingResponse.embedding, faq.id);

    res.json({ success: true, faq });
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({ error: 'Failed to create FAQ' });
  }
});

// Update FAQ
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;
    
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    const faq = await storageService.updateFAQ(id, question, answer);
    
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    // Update embedding
    const combinedText = `${question} ${answer}`;
    const embeddingResponse = await llmService.generateEmbedding(combinedText);
    
    // Remove old embeddings and add new one
    await storageService.removeEmbeddingsByFAQId(id);
    await storageService.addEmbedding(combinedText, embeddingResponse.embedding, id);

    res.json({ success: true, faq });
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
});

// Delete FAQ
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await storageService.deleteFAQ(id);
    
    if (!success) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
});

// Bulk save FAQs (for generated FAQs)
router.post('/bulk', async (req, res) => {
  try {
    const { faqs } = req.body;
    
    if (!Array.isArray(faqs)) {
      return res.status(400).json({ error: 'FAQs must be an array' });
    }

    const savedFAQs = [];
    
    for (const faqData of faqs) {
      if (!faqData.question || !faqData.answer) {
        continue; // Skip invalid FAQs
      }

      const faq = await storageService.addFAQ(faqData.question, faqData.answer);
      
      // Generate embedding
      const combinedText = `${faq.question} ${faq.answer}`;
      const embeddingResponse = await llmService.generateEmbedding(combinedText);
      await storageService.addEmbedding(combinedText, embeddingResponse.embedding, faq.id);
      
      savedFAQs.push(faq);
    }

    res.json({ success: true, faqs: savedFAQs });
  } catch (error) {
    console.error('Bulk save FAQs error:', error);
    res.status(500).json({ error: 'Failed to save FAQs' });
  }
});

export { router as faqRoutes };
