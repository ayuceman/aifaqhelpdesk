import fs from 'fs';
import path from 'path';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

export interface Embedding {
  id: string;
  text: string;
  embedding: number[];
  faqId: string;
  createdAt: string;
}

export interface EmbeddingMatch {
  faq: FAQ;
  score: number;
}

class StorageService {
  private dataDir = path.join(process.cwd(), 'data');
  private faqPath = path.join(this.dataDir, 'faq.json');
  private embeddingsPath = path.join(this.dataDir, 'embeddings.json');

  constructor() {
    this.ensureDataDirectory();
  }

  private ensureDataDirectory(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private readJSONFile<T>(filePath: string, defaultValue: T): T {
    try {
      if (!fs.existsSync(filePath)) {
        return defaultValue;
      }
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
      return defaultValue;
    }
  }

  private writeJSONFile<T>(filePath: string, data: T): void {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error writing ${filePath}:`, error);
      throw new Error(`Failed to write to ${filePath}`);
    }
  }

  // FAQ Management
  async getFAQs(): Promise<FAQ[]> {
    return this.readJSONFile<FAQ[]>(this.faqPath, []);
  }

  async saveFAQs(faqs: FAQ[]): Promise<void> {
    this.writeJSONFile(this.faqPath, faqs);
  }

  async addFAQ(question: string, answer: string): Promise<FAQ> {
    const faqs = await this.getFAQs();
    const newFAQ: FAQ = {
      id: Date.now().toString(),
      question,
      answer,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    faqs.push(newFAQ);
    await this.saveFAQs(faqs);
    return newFAQ;
  }

  async updateFAQ(id: string, question: string, answer: string): Promise<FAQ | null> {
    const faqs = await this.getFAQs();
    const index = faqs.findIndex(faq => faq.id === id);
    
    if (index === -1) {
      return null;
    }
    
    faqs[index] = {
      ...faqs[index],
      question,
      answer,
      updatedAt: new Date().toISOString(),
    };
    
    await this.saveFAQs(faqs);
    return faqs[index];
  }

  async deleteFAQ(id: string): Promise<boolean> {
    const faqs = await this.getFAQs();
    const index = faqs.findIndex(faq => faq.id === id);
    
    if (index === -1) {
      return false;
    }
    
    faqs.splice(index, 1);
    await this.saveFAQs(faqs);
    
    // Also remove associated embeddings
    await this.removeEmbeddingsByFAQId(id);
    
    return true;
  }

  // Embeddings Management
  async getEmbeddings(): Promise<Embedding[]> {
    return this.readJSONFile<Embedding[]>(this.embeddingsPath, []);
  }

  async saveEmbeddings(embeddings: Embedding[]): Promise<void> {
    this.writeJSONFile(this.embeddingsPath, embeddings);
  }

  async addEmbedding(text: string, embedding: number[], faqId: string): Promise<Embedding> {
    const embeddings = await this.getEmbeddings();
    const newEmbedding: Embedding = {
      id: Date.now().toString(),
      text,
      embedding,
      faqId,
      createdAt: new Date().toISOString(),
    };
    
    embeddings.push(newEmbedding);
    await this.saveEmbeddings(embeddings);
    return newEmbedding;
  }

  async removeEmbeddingsByFAQId(faqId: string): Promise<void> {
    const embeddings = await this.getEmbeddings();
    const filtered = embeddings.filter(emb => emb.faqId !== faqId);
    await this.saveEmbeddings(filtered);
  }

  // Similarity Search
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async findSimilarEmbeddings(queryEmbedding: number[], topK: number = 5, threshold: number = 0.7): Promise<EmbeddingMatch[]> {
    const embeddings = await this.getEmbeddings();
    const faqs = await this.getFAQs();
    
    const matches: Array<{ faq: FAQ; score: number }> = [];
    
    for (const embedding of embeddings) {
      try {
        const score = this.cosineSimilarity(queryEmbedding, embedding.embedding);
        
        if (score >= threshold) {
          const faq = faqs.find(f => f.id === embedding.faqId);
          if (faq) {
            matches.push({ faq, score });
          }
        }
      } catch (error) {
        console.error('Error calculating similarity:', error);
      }
    }
    
    // Sort by score descending and return top K
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

export const storageService = new StorageService();
