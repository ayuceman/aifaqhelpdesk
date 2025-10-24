import OpenAI from 'openai';
import { BaseAIProvider, ChatMessage, LLMResponse, EmbeddingResponse } from './BaseProvider';

export class OpenAIProvider extends BaseAIProvider {
  name = 'OpenAI';
  private client: OpenAI;
  private chatModel: string;
  private embeddingModel: string;

  constructor() {
    super();
    const apiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY || 'dummy-key';
    this.chatModel = process.env.OPENAI_MODEL || process.env.LLM_MODEL || 'gpt-3.5-turbo';
    this.embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || process.env.EMBEDDING_MODEL || 'text-embedding-3-small';

    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.openai.com/v1',
    });

    console.log(`[${this.name}] Initialized - Configured: ${this.isConfigured()}`);
  }

  isConfigured(): boolean {
    const apiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;
    return !!apiKey && apiKey !== 'your_openai_api_key_here' && apiKey !== 'dummy-key';
  }

  async chat(messages: ChatMessage[]): Promise<LLMResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.chatModel,
        messages,
        temperature: 0.7,
      });

      return {
        content: response.choices[0]?.message?.content || '',
        usage: response.usage ? {
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
          total_tokens: response.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      console.error(`[${this.name}] Chat Error:`, error);
      throw new Error(`${this.name} chat failed - check API key`);
    }
  }

  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    try {
      const response = await this.client.embeddings.create({
        model: this.embeddingModel,
        input: text,
      });

      return {
        embedding: response.data[0]?.embedding || [],
        usage: response.usage ? {
          prompt_tokens: response.usage.prompt_tokens,
          total_tokens: response.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      console.error(`[${this.name}] Embedding Error:`, error);
      throw new Error(`${this.name} embedding generation failed - check API key`);
    }
  }
}

