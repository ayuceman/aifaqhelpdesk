import express from 'express';
import { storageService } from '../services/storageService';
import { llmService } from '../services/llmService';
import { trialService } from '../services/trialService';
import { checkFAQLimit } from '../middleware/trialMiddleware';

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
router.post('/', checkFAQLimit, async (req, res) => {
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

    // Increment FAQ count for trial
    await trialService.incrementFAQCount(project);

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
router.post('/bulk', checkFAQLimit, async (req, res) => {
  try {
    const { faqs, project = 'default' } = req.body;
    
    if (!Array.isArray(faqs)) {
      return res.status(400).json({ error: 'FAQs must be an array' });
    }

    const savedFAQs = [];
    let faqCount = 0;
    
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
      faqCount++;
    }

    // Increment FAQ count for trial
    for (let i = 0; i < faqCount; i++) {
      await trialService.incrementFAQCount(project);
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

// Build embeddings for existing FAQs (with project support)
router.post('/build-embeddings', async (req, res) => {
  try {
    const { project = 'default' } = req.body;
    
    console.log(`Building embeddings for project: ${project}`);
    
    // Get all FAQs for the project
    const faqs = await storageService.getFAQs(project);
    console.log(`Found ${faqs.length} FAQs in project ${project}`);
    
    if (faqs.length === 0) {
      return res.json({ success: true, message: 'No FAQs found to build embeddings for', count: 0 });
    }
    
    // Clear existing embeddings
    await storageService.saveEmbeddings([], project);
    console.log('Cleared existing embeddings');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Build embeddings for each FAQ
    for (let i = 0; i < faqs.length; i++) {
      const faq = faqs[i];
      try {
        console.log(`Processing FAQ ${i + 1}/${faqs.length}: ${faq.question.substring(0, 50)}...`);
        
        const combinedText = `${faq.question} ${faq.answer}`;
        const embeddingResponse = await llmService.generateEmbedding(combinedText);
        await storageService.addEmbedding(combinedText, embeddingResponse.embedding, faq.id, project);
        successCount++;
      } catch (error) {
        console.error(`Error processing FAQ ${faq.id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`✅ Embeddings built: ${successCount} success, ${errorCount} errors`);
    
    res.json({ 
      success: true, 
      message: `Built embeddings for ${successCount} FAQs`, 
      count: successCount,
      errors: errorCount
    });
    
  } catch (error) {
    console.error('Build embeddings error:', error);
    res.status(500).json({ error: 'Failed to build embeddings' });
  }
});

// Get trial status for a project
router.get('/trial-status', async (req, res) => {
  try {
    const project = req.query.project as string || 'default';
    
    // Initialize trial if it doesn't exist
    await trialService.initializeTrial(project);
    
    const status = await trialService.getTrialStatus(project);
    res.json({ success: true, trialStatus: status });
  } catch (error) {
    console.error('Get trial status error:', error);
    res.status(500).json({ error: 'Failed to get trial status' });
  }
});

// Initialize free plan for a project
router.post('/initialize-free-plan', async (req, res) => {
  try {
    const project = req.body.project || 'default';
    
    const trialData = await trialService.initializeFreePlan(project);
    const status = await trialService.getTrialStatus(project);
    
    res.json({ success: true, trialData, trialStatus: status });
  } catch (error) {
    console.error('Initialize free plan error:', error);
    res.status(500).json({ error: 'Failed to initialize free plan' });
  }
});

export { router as faqRoutes };
