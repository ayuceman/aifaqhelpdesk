import { databaseService } from './databaseService';
import { llmService } from './llmService';

export class FAQService {
  async getFAQs(projectId: string) {
    return databaseService.getFAQsByProjectId(projectId);
  }

  async createFAQ(projectId: string, question: string, answer: string) {
    const faqId = databaseService.generateId();
    
    // Create FAQ
    databaseService.createFAQ({
      id: faqId,
      projectId,
      question,
      answer
    });

    // Generate embedding
    const combinedText = `${question} ${answer}`;
    const embeddingResponse = await llmService.generateEmbedding(combinedText);
    
    databaseService.createEmbedding({
      id: databaseService.generateId(),
      projectId,
      text: combinedText,
      embedding: embeddingResponse.embedding,
      faqId
    });

    // Update usage count
    const usage = databaseService.getProjectUsage(projectId);
    if (usage) {
      databaseService.updateProjectUsage(projectId, {
        faqCount: (usage.faq_count || 0) + 1
      });
    }

    return databaseService.getFAQsByProjectId(projectId).find(faq => faq.id === faqId);
  }

  async updateFAQ(faqId: string, question: string, answer: string) {
    databaseService.updateFAQ(faqId, { question, answer });

    // Update embedding
    const combinedText = `${question} ${answer}`;
    const embeddingResponse = await llmService.generateEmbedding(combinedText);
    
    // Delete old embedding and create new one
    const faq = databaseService.getFAQsByProjectId('').find(f => f.id === faqId);
    if (faq) {
      databaseService.createEmbedding({
        id: databaseService.generateId(),
        projectId: faq.project_id,
        text: combinedText,
        embedding: embeddingResponse.embedding,
        faqId
      });
    }

    return databaseService.getFAQsByProjectId('').find(faq => faq.id === faqId);
  }

  async deleteFAQ(faqId: string) {
    const faq = databaseService.getFAQsByProjectId('').find(f => f.id === faqId);
    if (faq) {
      // Update usage count
      const usage = databaseService.getProjectUsage(faq.project_id);
      if (usage) {
        databaseService.updateProjectUsage(faq.project_id, {
          faqCount: Math.max(0, (usage.faq_count || 0) - 1)
        });
      }
    }

    databaseService.deleteFAQ(faqId);
  }

  async bulkCreateFAQs(projectId: string, faqs: Array<{ question: string; answer: string }>) {
    const createdFAQs = [];
    
    for (const faqData of faqs) {
      const faqId = databaseService.generateId();
      
      // Create FAQ
      databaseService.createFAQ({
        id: faqId,
        projectId,
        question: faqData.question,
        answer: faqData.answer
      });

      // Generate embedding
      const combinedText = `${faqData.question} ${faqData.answer}`;
      const embeddingResponse = await llmService.generateEmbedding(combinedText);
      
      databaseService.createEmbedding({
        id: databaseService.generateId(),
        projectId,
        text: combinedText,
        embedding: embeddingResponse.embedding,
        faqId
      });

      createdFAQs.push({ id: faqId, ...faqData });
    }

    // Update usage count
    const usage = databaseService.getProjectUsage(projectId);
    if (usage) {
      databaseService.updateProjectUsage(projectId, {
        faqCount: (usage.faq_count || 0) + createdFAQs.length
      });
    }

    return createdFAQs;
  }

  async buildEmbeddings(projectId: string) {
    const faqs = databaseService.getFAQsByProjectId(projectId);
    
    // Clear existing embeddings
    databaseService.deleteEmbeddingsByProjectId(projectId);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const faq of faqs) {
      try {
        const combinedText = `${faq.question} ${faq.answer}`;
        const embeddingResponse = await llmService.generateEmbedding(combinedText);
        
        databaseService.createEmbedding({
          id: databaseService.generateId(),
          projectId,
          text: combinedText,
          embedding: embeddingResponse.embedding,
          faqId: faq.id
        });
        
        successCount++;
      } catch (error) {
        console.error(`Error processing FAQ ${faq.id}:`, error);
        errorCount++;
      }
    }
    
    return { successCount, errorCount };
  }

  async getEmbeddings(projectId: string) {
    const embeddings = databaseService.getEmbeddingsByProjectId(projectId);
    return embeddings.map(emb => ({
      id: emb.id,
      text: emb.text,
      embedding: JSON.parse(emb.embedding),
      faqId: emb.faq_id
    }));
  }
}

export const faqService = new FAQService();
