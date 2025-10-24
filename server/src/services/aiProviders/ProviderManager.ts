import { BaseAIProvider, ChatMessage, LLMResponse, EmbeddingResponse } from './BaseProvider';
import { OllamaProvider } from './OllamaProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { HuggingFaceProvider } from './HuggingFaceProvider';
import { GeminiProvider } from './GeminiProvider';

export type AIProviderType = 'ollama' | 'openai' | 'huggingface' | 'gemini';

export class ProviderManager {
  private providers: Map<AIProviderType, BaseAIProvider>;
  private activeProvider: AIProviderType;

  constructor() {
    // Initialize all providers
    this.providers = new Map([
      ['ollama', new OllamaProvider()],
      ['openai', new OpenAIProvider()],
      ['huggingface', new HuggingFaceProvider()],
      ['gemini', new GeminiProvider()],
    ]);

    // Determine default provider based on environment
    this.activeProvider = this.determineDefaultProvider();
    
    console.log(`[ProviderManager] Active provider: ${this.activeProvider}`);
    console.log(`[ProviderManager] Available providers:`, this.getAvailableProviders());
  }

  private determineDefaultProvider(): AIProviderType {
    // Check environment variable first
    const envProvider = process.env.AI_PROVIDER?.toLowerCase() as AIProviderType;
    if (envProvider && this.providers.has(envProvider)) {
      const provider = this.providers.get(envProvider)!;
      if (provider.isConfigured()) {
        return envProvider;
      }
    }

    // Legacy: Check USE_OLLAMA flag
    if (process.env.USE_OLLAMA === 'true' || !process.env.LLM_API_KEY || process.env.LLM_API_KEY === 'your_openai_api_key_here') {
      return 'ollama';
    }

    // Check each provider in priority order
    const priorityOrder: AIProviderType[] = ['ollama', 'openai', 'gemini', 'huggingface'];
    
    for (const providerType of priorityOrder) {
      const provider = this.providers.get(providerType)!;
      if (provider.isConfigured()) {
        return providerType;
      }
    }

    // Default to Ollama (local, always available)
    return 'ollama';
  }

  getActiveProvider(): BaseAIProvider {
    return this.providers.get(this.activeProvider)!;
  }

  getActiveProviderName(): string {
    return this.getActiveProvider().name;
  }

  getActiveProviderType(): AIProviderType {
    return this.activeProvider;
  }

  setActiveProvider(providerType: AIProviderType): boolean {
    if (!this.providers.has(providerType)) {
      console.error(`[ProviderManager] Unknown provider: ${providerType}`);
      return false;
    }

    const provider = this.providers.get(providerType)!;
    if (!provider.isConfigured()) {
      console.error(`[ProviderManager] Provider ${providerType} is not configured`);
      return false;
    }

    this.activeProvider = providerType;
    console.log(`[ProviderManager] Switched to provider: ${providerType}`);
    return true;
  }

  getAvailableProviders(): Array<{ type: AIProviderType; name: string; configured: boolean }> {
    return Array.from(this.providers.entries()).map(([type, provider]) => ({
      type,
      name: provider.name,
      configured: provider.isConfigured(),
    }));
  }

  async chat(messages: ChatMessage[]): Promise<LLMResponse> {
    return this.getActiveProvider().chat(messages);
  }

  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    return this.getActiveProvider().generateEmbedding(text);
  }
}

