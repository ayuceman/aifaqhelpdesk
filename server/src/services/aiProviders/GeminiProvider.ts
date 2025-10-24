import axios from 'axios';
import { BaseAIProvider, ChatMessage, LLMResponse, EmbeddingResponse } from './BaseProvider';

export class GeminiProvider extends BaseAIProvider {
  name = 'Google Gemini';
  private apiKey: string;
  private chatModel: string;
  private embeddingModel: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    super();
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.chatModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.embeddingModel = process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';

    console.log(`[${this.name}] Initialized - Chat: ${this.chatModel}, Embedding: ${this.embeddingModel}`);
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== 'your_gemini_api_key_here';
  }

  async chat(messages: ChatMessage[]): Promise<LLMResponse> {
    try {
      // Convert messages to Gemini format
      const contents = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

      // Prepend system message as first user message if exists
      const systemMessage = messages.find(m => m.role === 'system');
      if (systemMessage && contents.length > 0) {
        contents[0].parts[0].text = `${systemMessage.content}\n\n${contents[0].parts[0].text}`;
      }

      const response = await axios.post(
        `${this.baseUrl}/models/${this.chatModel}:generateContent?key=${this.apiKey}`,
        {
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          }
        }
      );

      const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return {
        content,
        usage: response.data?.usageMetadata ? {
          prompt_tokens: response.data.usageMetadata.promptTokenCount || 0,
          completion_tokens: response.data.usageMetadata.candidatesTokenCount || 0,
          total_tokens: response.data.usageMetadata.totalTokenCount || 0,
        } : undefined,
      };
    } catch (error: any) {
      console.error(`[${this.name}] Chat Error:`, error?.response?.data || error.message);
      throw new Error(`${this.name} chat failed - check API key`);
    }
  }

  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${this.embeddingModel}:embedContent?key=${this.apiKey}`,
        {
          model: `models/${this.embeddingModel}`,
          content: {
            parts: [{ text }]
          }
        }
      );

      const embedding = response.data?.embedding?.values || [];

      return {
        embedding,
        usage: undefined,
      };
    } catch (error: any) {
      console.error(`[${this.name}] Embedding Error:`, error?.response?.data || error.message);
      throw new Error(`${this.name} embedding generation failed - check API key`);
    }
  }
}

