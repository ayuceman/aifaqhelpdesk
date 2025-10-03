import OpenAI from 'openai';

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

class LLMService {
  private client: OpenAI;
  private useOllama: boolean;

  constructor() {
    // Default to Ollama if no API key is provided
    this.useOllama = !process.env.LLM_API_KEY || process.env.LLM_API_KEY === 'your_openai_api_key_here' || process.env.USE_OLLAMA === 'true';
    
    const apiKey = this.useOllama ? 'ollama' : process.env.LLM_API_KEY;
    const baseURL = this.useOllama 
      ? (process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1')
      : (process.env.LLM_BASE_URL || 'https://api.openai.com/v1');

    this.client = new OpenAI({
      apiKey,
      baseURL,
    });

    console.log(`LLM Service initialized: ${this.useOllama ? 'Ollama (Local)' : 'OpenAI'}`);
    console.log(`Base URL: ${baseURL}`);
  }

  async chat(messages: ChatMessage[]): Promise<LLMResponse> {
    try {
      const model = this.useOllama 
        ? (process.env.OLLAMA_MODEL || 'llama3.2')
        : (process.env.LLM_MODEL || 'gpt-3.5-turbo');

      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: this.useOllama ? 2000 : undefined, // Limit output for faster generation
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
      console.error('LLM Chat Error:', error);
      throw new Error('Failed to generate response from LLM');
    }
  }

  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    try {
      const model = this.useOllama 
        ? (process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text')
        : (process.env.EMBEDDING_MODEL || 'text-embedding-ada-002');

      const response = await this.client.embeddings.create({
        model,
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
      console.error('Embedding Error:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  async generateFAQ(text: string, tone: 'formal' | 'concise' | 'friendly', maxQuestions: number): Promise<{ faqs: Array<{ question: string; answer: string }> }> {
    const toneInstructions = {
      formal: 'Professional tone with complete sentences.',
      concise: 'Direct and brief answers.',
      friendly: 'Warm and conversational.'
    };

    // Truncate content if too long to speed up processing
    const maxContentLength = 3000; // ~750 words
    const truncatedText = text.length > maxContentLength 
      ? text.substring(0, maxContentLength) + '...'
      : text;

    const systemPrompt = `Create ${maxQuestions} FAQ pairs. ${toneInstructions[tone]}

CRITICAL: Return ONLY valid JSON, no other text.

Format:
{
  "faqs": [
    {"question": "Q text", "answer": "A text"}
  ]
}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Create ${maxQuestions} FAQs as JSON:\n\n${truncatedText}` }
    ];

    const response = await this.chat(messages);
    
    try {
      // Extract JSON from response - handle cases where model adds extra text
      let jsonContent = response.content.trim();
      
      // Remove markdown code blocks if present
      jsonContent = jsonContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Remove <think> tags and similar model reasoning artifacts
      jsonContent = jsonContent.replace(/<think>[\s\S]*?<\/think>/gi, '');
      jsonContent = jsonContent.replace(/<\/?[^>]+(>|$)/g, ''); // Remove any HTML-like tags
      
      // Find JSON object in the text
      const jsonStart = jsonContent.indexOf('{');
      const jsonEnd = jsonContent.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
      }
      
      // Fix common JSON issues from LLM output
      // Fix truncated strings (missing closing quotes)
      jsonContent = jsonContent.replace(/"answer":\s*"([^"]*?)$/gm, '"answer": "$1"');
      
      // Ensure proper array closing if truncated
      if (!jsonContent.includes(']')) {
        const lastComma = jsonContent.lastIndexOf(',');
        if (lastComma > -1) {
          jsonContent = jsonContent.substring(0, lastComma) + ']}';
        }
      }
      
      // Try to fix incomplete JSON objects
      const openBraces = (jsonContent.match(/{/g) || []).length;
      const closeBraces = (jsonContent.match(/}/g) || []).length;
      if (openBraces > closeBraces) {
        jsonContent += '}'.repeat(openBraces - closeBraces);
      }
      
      const parsed = JSON.parse(jsonContent);
      
      // Validate structure
      if (!parsed.faqs || !Array.isArray(parsed.faqs)) {
        throw new Error('Invalid FAQ structure: missing faqs array');
      }
      
      // Clean and validate each FAQ entry
      parsed.faqs = parsed.faqs
        .filter((faq: any) => 
          faq && typeof faq.question === 'string' && typeof faq.answer === 'string'
        )
        .map((faq: any) => ({
          question: faq.question.replace(/^(Q\d+:?\s*|Question:?\s*)/i, '').trim(),
          answer: faq.answer.replace(/^(A\d+:?\s*|Answer:?\s*)/i, '').trim()
        }));
      
      if (parsed.faqs.length === 0) {
        throw new Error('No valid FAQ entries generated');
      }
      
      return parsed;
    } catch (error) {
      console.error('Failed to parse FAQ JSON:', error);
      console.error('Raw response:', response.content.substring(0, 1000));
      throw new Error('Invalid FAQ response format. The model did not return valid JSON.');
    }
  }

  async generateAnswer(question: string, context: string[]): Promise<string> {
    const systemPrompt = `You are a helpful assistant. Answer the user's question based on the provided context. If the context doesn't contain enough information to answer the question, say so politely.

Context:
${context.join('\n\n')}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question }
    ];

    const response = await this.chat(messages);
    return response.content;
  }
}

export const llmService = new LLMService();
