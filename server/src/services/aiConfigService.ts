import crypto from 'crypto';
import { databaseService } from './databaseService';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here!';
const ALGORITHM = 'aes-256-gcm';

export interface ProviderConfig {
  providerType: 'openai' | 'gemini' | 'huggingface' | 'ollama';
  apiKey?: string;
  model?: string;
  embeddingModel?: string;
  baseUrl?: string;
  isActive: boolean;
}

export class AIConfigService {
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(encryptedText: string): string {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedData = textParts.join(':');
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async saveProviderConfig(userId: string, config: ProviderConfig): Promise<any> {
    // Deactivate all other providers for this user
    const allConfigs = databaseService.getAIProviderConfigs(userId);
    for (const existingConfig of allConfigs) {
      if (existingConfig.is_active) {
        databaseService.updateAIProviderConfig(userId, existingConfig.provider_type, { isActive: false });
      }
    }

    // Encrypt API key if provided
    const encryptedApiKey = config.apiKey ? this.encrypt(config.apiKey) : null;

    // Create or update the provider config
    const result = databaseService.createAIProviderConfig({
      userId,
      providerType: config.providerType,
      apiKey: encryptedApiKey,
      model: config.model,
      embeddingModel: config.embeddingModel,
      baseUrl: config.baseUrl,
      isActive: config.isActive,
    });

    return { id: result.lastInsertRowid, ...config };
  }

  async getProviderConfig(userId: string, providerType?: string): Promise<any | null> {
    const config = databaseService.getAIProviderConfig(userId, providerType);

    if (config && config.api_key) {
      // Decrypt API key for use
      config.api_key = this.decrypt(config.api_key);
    }

    return config;
  }

  async getActiveProviderConfig(userId: string): Promise<any | null> {
    return this.getProviderConfig(userId);
  }

  async getAllProviderConfigs(userId: string): Promise<any[]> {
    const configs = databaseService.getAIProviderConfigs(userId);

    // Decrypt API keys for display (but mask them)
    return configs.map(config => {
      if (config.api_key) {
        config.api_key = this.maskApiKey(this.decrypt(config.api_key));
      }
      return config;
    });
  }

  async deleteProviderConfig(userId: string, providerType: string): Promise<boolean> {
    const result = databaseService.deleteAIProviderConfig(userId, providerType);
    return result.changes > 0;
  }

  private maskApiKey(apiKey: string): string {
    if (apiKey.length <= 8) {
      return '*'.repeat(apiKey.length);
    }
    return apiKey.substring(0, 4) + '*'.repeat(apiKey.length - 8) + apiKey.substring(apiKey.length - 4);
  }

  async testProviderConfig(config: ProviderConfig): Promise<{ success: boolean; message: string; response?: any }> {
    try {
      // This will be implemented based on the provider type
      // For now, return a basic test
      if (config.providerType === 'openai' && config.apiKey) {
        // Test OpenAI API
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
          },
        });
        
        if (response.ok) {
          return { success: true, message: 'OpenAI API key is valid' };
        } else {
          return { success: false, message: 'OpenAI API key is invalid' };
        }
      }

      if (config.providerType === 'gemini' && config.apiKey) {
        // Test Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${config.apiKey}`);
        
        if (response.ok) {
          return { success: true, message: 'Gemini API key is valid' };
        } else {
          return { success: false, message: 'Gemini API key is invalid' };
        }
      }

      if (config.providerType === 'huggingface' && config.apiKey) {
        // Test Hugging Face API
        const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
          },
        });
        
        if (response.ok) {
          return { success: true, message: 'Hugging Face API key is valid' };
        } else {
          return { success: false, message: 'Hugging Face API key is invalid' };
        }
      }

      if (config.providerType === 'ollama') {
        // Test Ollama (no API key needed)
        const response = await fetch(`${config.baseUrl || 'http://localhost:11434'}/api/tags`);
        
        if (response.ok) {
          return { success: true, message: 'Ollama is accessible' };
        } else {
          return { success: false, message: 'Ollama is not accessible' };
        }
      }

      return { success: false, message: 'Unknown provider type' };
    } catch (error: any) {
      return { success: false, message: `Test failed: ${error.message}` };
    }
  }
}

export const aiConfigService = new AIConfigService();
