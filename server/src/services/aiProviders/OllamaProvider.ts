import OpenAI from 'openai';
import axios from 'axios';
import { BaseAIProvider, ChatMessage, LLMResponse, EmbeddingResponse } from './BaseProvider';

export class OllamaProvider extends BaseAIProvider {
  name = 'Ollama';
  private client: OpenAI;
  private baseUrl: string;
  private chatModel: string;
  private embeddingModel: string;

  constructor() {
    super();
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';
    this.chatModel = process.env.OLLAMA_MODEL || 'qwen2.5:3b';
    this.embeddingModel = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';

    this.client = new OpenAI({
      apiKey: 'ollama',
      baseURL: this.baseUrl,
    });

    console.log(`[${this.name}] Initialized - Chat: ${this.chatModel}, Embedding: ${this.embeddingModel}`);
  }

  isConfigured(): boolean {
    // Ollama is always "configured" if running locally
    return true;
  }

  async chat(messages: ChatMessage[]): Promise<LLMResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.chatModel,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
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
      throw new Error(`${this.name} chat failed`);
    }
  }

  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    try {
      // Use native Ollama API for embeddings (OpenAI-compatible API has issues)
      const ollamaApiUrl = this.baseUrl.replace('/v1', '/api/embeddings');
      
      const response = await axios.post(ollamaApiUrl, {
        model: this.embeddingModel,
        prompt: text
      });

      return {
        embedding: response.data.embedding || [],
        usage: undefined,
      };
    } catch (error) {
      console.error(`[${this.name}] Embedding Error:`, error);
      throw new Error(`${this.name} embedding generation failed`);
    }
  }
}

