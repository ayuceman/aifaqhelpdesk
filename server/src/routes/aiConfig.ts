import express, { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { aiConfigService } from '../services/aiConfigService';

const router: Router = express.Router();

// Get all AI provider configurations for user
router.get('/configs', authenticateToken, async (req, res) => {
  try {
    const configs = await aiConfigService.getAllProviderConfigs(req.user!.id);
    // Map database fields to frontend fields
    const mappedConfigs = configs.map(config => ({
      id: config.id,
      providerType: config.provider_type,
      apiKey: config.api_key,
      model: config.model,
      embeddingModel: config.embedding_model,
      baseUrl: config.base_url,
      isActive: config.is_active === 1,
      createdAt: config.created_at,
      updatedAt: config.updated_at,
    }));
    res.json({ success: true, configs: mappedConfigs });
  } catch (error: any) {
    console.error('Error getting AI configs:', error);
    res.status(500).json({ error: 'Failed to get AI configurations' });
  }
});

// Get specific provider configuration
router.get('/configs/:providerType', authenticateToken, async (req, res) => {
  try {
    const { providerType } = req.params;
    const config = await aiConfigService.getProviderConfig(req.user!.id, providerType);
    
    if (!config) {
      return res.status(404).json({ error: 'Provider configuration not found' });
    }

    // Map database fields to frontend fields
    const mappedConfig = {
      id: config.id,
      providerType: config.provider_type,
      apiKey: config.api_key,
      model: config.model,
      embeddingModel: config.embedding_model,
      baseUrl: config.base_url,
      isActive: config.is_active === 1,
      createdAt: config.created_at,
      updatedAt: config.updated_at,
    };

    res.json({ success: true, config: mappedConfig });
  } catch (error: any) {
    console.error('Error getting AI config:', error);
    res.status(500).json({ error: 'Failed to get AI configuration' });
  }
});

// Save AI provider configuration
router.post('/configs', authenticateToken, async (req, res) => {
  try {
    const { providerType, apiKey, model, embeddingModel, baseUrl, isActive } = req.body;

    if (!providerType) {
      return res.status(400).json({ error: 'Provider type is required' });
    }

    const config = await aiConfigService.saveProviderConfig(req.user!.id, {
      providerType,
      apiKey,
      model,
      embeddingModel,
      baseUrl,
      isActive: isActive || false,
    });

    res.json({ success: true, config });
  } catch (error: any) {
    console.error('Error saving AI config:', error);
    res.status(500).json({ error: 'Failed to save AI configuration' });
  }
});

// Test AI provider configuration
router.post('/configs/test', authenticateToken, async (req, res) => {
  try {
    const { providerType, apiKey, model, embeddingModel, baseUrl } = req.body;

    if (!providerType) {
      return res.status(400).json({ error: 'Provider type is required' });
    }

    const result = await aiConfigService.testProviderConfig({
      providerType,
      apiKey,
      model,
      embeddingModel,
      baseUrl,
      isActive: false,
    });

    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Error testing AI config:', error);
    res.status(500).json({ error: 'Failed to test AI configuration' });
  }
});

// Delete AI provider configuration
router.delete('/configs/:providerType', authenticateToken, async (req, res) => {
  try {
    const { providerType } = req.params;
    const deleted = await aiConfigService.deleteProviderConfig(req.user!.id, providerType);

    if (!deleted) {
      return res.status(404).json({ error: 'Provider configuration not found' });
    }

    res.json({ success: true, message: 'Configuration deleted' });
  } catch (error: any) {
    console.error('Error deleting AI config:', error);
    res.status(500).json({ error: 'Failed to delete AI configuration' });
  }
});

export default router;
