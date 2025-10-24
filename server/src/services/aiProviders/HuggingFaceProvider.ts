import axios from 'axios';
import { BaseAIProvider, ChatMessage, LLMResponse, EmbeddingResponse } from './BaseProvider';

export class HuggingFaceProvider extends BaseAIProvider {
  name = 'Hugging Face';
  private apiKey: string;
  private chatModel: string;
  private embeddingModel: string;
  private baseUrl = 'https://api-inference.huggingface.co/models';

  constructor() {
    super();
    this.apiKey = process.env.HUGGINGFACE_API_KEY || '';
    this.chatModel = process.env.HUGGINGFACE_MODEL || 'microsoft/phi-2';
    this.embeddingModel = process.env.HUGGINGFACE_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';

    console.log(`[${this.name}] Initialized - Chat: ${this.chatModel}, Embedding: ${this.embeddingModel}`);
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== 'your_huggingface_api_key_here';
  }

  async chat(messages: ChatMessage[]): Promise<LLMResponse> {
    try {
      // Convert messages to prompt format
      const prompt = messages.map(m => {
        if (m.role === 'system') return `System: ${m.content}`;
        if (m.role === 'user') return `User: ${m.content}`;
        return `Assistant: ${m.content}`;
      }).join('\n') + '\nAssistant:';

      const response = await axios.post(
        `${this.baseUrl}/${this.chatModel}`,
        { inputs: prompt, parameters: { max_new_tokens: 500, temperature: 0.7 } },
        { headers: { Authorization: `Bearer ${this.apiKey}` } }
      );

      const content = Array.isArray(response.data) 
        ? response.data[0]?.generated_text || ''
        : response.data?.generated_text || response.data?.[0] || '';

      // Clean up the response
      const cleanContent = content.replace(prompt, '').trim();

      return {
        content: cleanContent,
        usage: undefined,
      };
    } catch (error: any) {
      console.error(`[${this.name}] Chat Error:`, error?.response?.data || error.message);
      throw new Error(`${this.name} chat failed - check API key and model availability`);
    }
  }

  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.embeddingModel}`,
        { inputs: text },
        { headers: { Authorization: `Bearer ${this.apiKey}` } }
      );

      // Hugging Face returns embeddings directly as array
      const embedding = Array.isArray(response.data) ? response.data : [];

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

