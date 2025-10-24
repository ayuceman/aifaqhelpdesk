// Base interface for all AI providers
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface EmbeddingResponse {
  embedding: number[];
  usage?: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export abstract class BaseAIProvider {
  abstract name: string;
  abstract chat(messages: ChatMessage[]): Promise<LLMResponse>;
  abstract generateEmbedding(text: string): Promise<EmbeddingResponse>;
  abstract isConfigured(): boolean;
}

