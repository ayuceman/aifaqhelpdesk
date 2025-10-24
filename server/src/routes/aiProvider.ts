import express from 'express';
import { llmService } from '../services/llmService';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Get current AI provider and available providers
router.get('/provider', authMiddleware, async (req, res) => {
  try {
    const activeProvider = llmService.getActiveProviderType();
    const availableProviders = llmService.getAvailableProviders();

    res.json({
      success: true,
      activeProvider,
      availableProviders,
    });
  } catch (error) {
    console.error('Error getting AI provider:', error);
    res.status(500).json({ error: 'Failed to get AI provider information' });
  }
});

// Set AI provider (requires authentication)
router.post('/provider', authMiddleware, async (req, res) => {
  try {
    const { provider } = req.body;

    if (!provider || typeof provider !== 'string') {
      return res.status(400).json({ error: 'Provider type is required' });
    }

    const validProviders = ['ollama', 'openai', 'huggingface', 'gemini'];
    if (!validProviders.includes(provider)) {
      return res.status(400).json({ 
        error: 'Invalid provider type', 
        validProviders 
      });
    }

    const success = llmService.setProvider(provider as any);

    if (success) {
      res.json({
        success: true,
        message: `Switched to ${provider} provider`,
        activeProvider: llmService.getActiveProviderType(),
      });
    } else {
      res.status(400).json({
        error: `Failed to switch to ${provider}. Provider may not be configured.`,
        hint: 'Check your environment variables and API keys'
      });
    }
  } catch (error) {
    console.error('Error setting AI provider:', error);
    res.status(500).json({ error: 'Failed to set AI provider' });
  }
});

// Test AI provider (send a test message)
router.post('/provider/test', authMiddleware, async (req, res) => {
  try {
    const { provider } = req.body;

    // Temporarily switch if provider specified
    const currentProvider = llmService.getActiveProviderType();
    if (provider && provider !== currentProvider) {
      const switched = llmService.setProvider(provider);
      if (!switched) {
        return res.status(400).json({ 
          error: `Cannot test ${provider} - provider not configured` 
        });
      }
    }

    // Test chat
    const chatResponse = await llmService.chat([
      { role: 'user', content: 'Say "Hello! I am working correctly." and nothing else.' }
    ]);

    // Test embedding
    const embeddingResponse = await llmService.generateEmbedding('test');

    // Restore original provider if we switched
    if (provider && provider !== currentProvider) {
      llmService.setProvider(currentProvider);
    }

    res.json({
      success: true,
      chatTest: {
        response: chatResponse.content,
        working: chatResponse.content.length > 0
      },
      embeddingTest: {
        dimensions: embeddingResponse.embedding.length,
        working: embeddingResponse.embedding.length > 0
      },
      provider: provider || currentProvider
    });
  } catch (error: any) {
    console.error('Error testing AI provider:', error);
    res.status(500).json({ 
      error: 'Provider test failed', 
      details: error.message 
    });
  }
});

export default router;

