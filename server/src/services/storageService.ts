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
  private baseDataDir = path.join(process.cwd(), 'data');
  private projectsDir = path.join(this.baseDataDir, 'projects');

  constructor() {
    this.ensureBaseDirectories();
  }

  private ensureBaseDirectories(): void {
    if (!fs.existsSync(this.baseDataDir)) {
      fs.mkdirSync(this.baseDataDir, { recursive: true });
    }
    if (!fs.existsSync(this.projectsDir)) {
      fs.mkdirSync(this.projectsDir, { recursive: true });
    }
  }

  private getProjectDir(project: string = 'default'): string {
    const projectDir = path.join(this.projectsDir, project);
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }
    return projectDir;
  }

  private getFaqPath(project: string = 'default'): string {
    return path.join(this.getProjectDir(project), 'faq.json');
  }

  private getEmbeddingsPath(project: string = 'default'): string {
    return path.join(this.getProjectDir(project), 'embeddings.json');
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

  // FAQ Management with project support
  async getFAQs(project: string = 'default'): Promise<FAQ[]> {
    return this.readJSONFile<FAQ[]>(this.getFaqPath(project), []);
  }

  async saveFAQs(faqs: FAQ[], project: string = 'default'): Promise<void> {
    this.writeJSONFile(this.getFaqPath(project), faqs);
  }

  async addFAQ(question: string, answer: string, project: string = 'default'): Promise<FAQ> {
    const faqs = await this.getFAQs(project);
    const newFAQ: FAQ = {
      id: Date.now().toString(),
      question,
      answer,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    faqs.push(newFAQ);
    await this.saveFAQs(faqs, project);
    return newFAQ;
  }

  async updateFAQ(id: string, question: string, answer: string, project: string = 'default'): Promise<FAQ | null> {
    const faqs = await this.getFAQs(project);
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
    
    await this.saveFAQs(faqs, project);
    return faqs[index];
  }

  async deleteFAQ(id: string, project: string = 'default'): Promise<boolean> {
    const faqs = await this.getFAQs(project);
    const index = faqs.findIndex(faq => faq.id === id);
    
    if (index === -1) {
      return false;
    }
    
    faqs.splice(index, 1);
    await this.saveFAQs(faqs, project);
    
    // Also remove associated embeddings
    await this.removeEmbeddingsByFAQId(id, project);
    
    return true;
  }

  // Embeddings Management with project support
  async getEmbeddings(project: string = 'default'): Promise<Embedding[]> {
    return this.readJSONFile<Embedding[]>(this.getEmbeddingsPath(project), []);
  }

  async saveEmbeddings(embeddings: Embedding[], project: string = 'default'): Promise<void> {
    this.writeJSONFile(this.getEmbeddingsPath(project), embeddings);
  }

  async addEmbedding(text: string, embedding: number[], faqId: string, project: string = 'default'): Promise<Embedding> {
    const embeddings = await this.getEmbeddings(project);
    const newEmbedding: Embedding = {
      id: Date.now().toString(),
      text,
      embedding,
      faqId,
      createdAt: new Date().toISOString(),
    };
    
    embeddings.push(newEmbedding);
    await this.saveEmbeddings(embeddings, project);
    return newEmbedding;
  }

  async removeEmbeddingsByFAQId(faqId: string, project: string = 'default'): Promise<void> {
    const embeddings = await this.getEmbeddings(project);
    const filtered = embeddings.filter(emb => emb.faqId !== faqId);
    await this.saveEmbeddings(filtered, project);
  }

  // Similarity Search with project support
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

  async findSimilarEmbeddings(
    queryEmbedding: number[], 
    topK: number = 5, 
    threshold: number = 0.5,
    project: string = 'default'
  ): Promise<EmbeddingMatch[]> {
    const embeddings = await this.getEmbeddings(project);
    const faqs = await this.getFAQs(project);
    
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

  // Project management
  async listProjects(): Promise<string[]> {
    try {
      if (!fs.existsSync(this.projectsDir)) {
        return [];
      }
      return fs.readdirSync(this.projectsDir).filter(file => {
        const stats = fs.statSync(path.join(this.projectsDir, file));
        return stats.isDirectory();
      });
    } catch (error) {
      console.error('Error listing projects:', error);
      return [];
    }
  }
}

export const storageService = new StorageService();