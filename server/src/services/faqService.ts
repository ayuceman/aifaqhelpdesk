import { databaseService } from './databaseService';
import { llmService } from './llmService';

export class FAQService {
  async getFAQs(projectId: string) {
    return databaseService.getFAQsByProjectId(projectId);
  }

  async getFAQsWithPagination(projectId: string, options: {
    page: number;
    limit: number;
    search?: string;
    sortBy: string;
    sortOrder: string;
    category?: string;
  }) {
    const { page, limit, search, sortBy, sortOrder, category } = options;
    const offset = (page - 1) * limit;
    
    // Build query with filters
    let whereClause = 'WHERE project_id = ?';
    const params: any[] = [projectId];
    
    if (search) {
      whereClause += ' AND (question LIKE ? OR answer LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }
    
    // Get total count
    const countStmt = databaseService.db.prepare(`
      SELECT COUNT(*) as total FROM faqs ${whereClause}
    `);
    const totalResult = countStmt.get(...params);
    const total = totalResult.total;
    
    // Get paginated results
    const orderBy = `${sortBy} ${sortOrder.toUpperCase()}`;
    const stmt = databaseService.db.prepare(`
      SELECT * FROM faqs ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?
    `);
    const faqs = stmt.all(...params, limit, offset);
    
    return {
      faqs,
      total,
      page,
      limit
    };
  }

  async searchFAQs(projectId: string, options: {
    query: string;
    filters: any;
    page: number;
    limit: number;
  }) {
    const { query, filters, page, limit } = options;
    const offset = (page - 1) * limit;
    
    // Build search query
    let whereClause = 'WHERE project_id = ?';
    const params: any[] = [projectId];
    
    // Full-text search
    whereClause += ' AND (question LIKE ? OR answer LIKE ?)';
    const searchTerm = `%${query}%`;
    params.push(searchTerm, searchTerm);
    
    // Apply additional filters
    if (filters.category) {
      whereClause += ' AND category = ?';
      params.push(filters.category);
    }
    
    if (filters.dateFrom) {
      whereClause += ' AND created_at >= ?';
      params.push(filters.dateFrom);
    }
    
    if (filters.dateTo) {
      whereClause += ' AND created_at <= ?';
      params.push(filters.dateTo);
    }
    
    // Get total count
    const countStmt = databaseService.db.prepare(`
      SELECT COUNT(*) as total FROM faqs ${whereClause}
    `);
    const totalResult = countStmt.get(...params);
    const total = totalResult.total;
    
    // Get search results
    const stmt = databaseService.db.prepare(`
      SELECT * FROM faqs ${whereClause} 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    const faqs = stmt.all(...params, limit, offset);
    
    return {
      faqs,
      total,
      page,
      limit
    };
  }

  async bulkOperation(projectId: string, operation: string, faqIds: string[], data: any) {
    const results = {
      processed: 0,
      failed: 0,
      errors: [] as string[]
    };
    
    for (const faqId of faqIds) {
      try {
        switch (operation) {
          case 'delete':
            await this.deleteFAQ(faqId);
            break;
          case 'update':
            if (data.question && data.answer) {
              await this.updateFAQ(faqId, data.question, data.answer);
            }
            break;
          case 'categorize':
            if (data.category) {
              await this.updateFAQCategory(faqId, data.category);
            }
            break;
          case 'export':
            // Export logic would be handled separately
            break;
        }
        results.processed++;
      } catch (error) {
        results.failed++;
        results.errors.push(`FAQ ${faqId}: ${error}`);
      }
    }
    
    return results;
  }

  async getFAQsAnalytics(projectId: string, period: string) {
    const now = new Date();
    let dateFilter = '';
    
    switch (period) {
      case '7d':
        dateFilter = `AND created_at >= datetime('now', '-7 days')`;
        break;
      case '30d':
        dateFilter = `AND created_at >= datetime('now', '-30 days')`;
        break;
      case '90d':
        dateFilter = `AND created_at >= datetime('now', '-90 days')`;
        break;
      case '1y':
        dateFilter = `AND created_at >= datetime('now', '-1 year')`;
        break;
    }
    
    // Get basic stats
    const statsStmt = databaseService.db.prepare(`
      SELECT 
        COUNT(*) as total_faqs,
        COUNT(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 END) as faqs_this_week,
        COUNT(CASE WHEN created_at >= datetime('now', '-30 days') THEN 1 END) as faqs_this_month
      FROM faqs 
      WHERE project_id = ? ${dateFilter}
    `);
    const stats = statsStmt.get(projectId);
    
    // Get category distribution
    const categoryStmt = databaseService.db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM faqs 
      WHERE project_id = ? ${dateFilter}
      GROUP BY category 
      ORDER BY count DESC
    `);
    const categories = categoryStmt.all(projectId);
    
    // Get recent activity
    const recentStmt = databaseService.db.prepare(`
      SELECT * FROM faqs 
      WHERE project_id = ? ${dateFilter}
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    const recentFAQs = recentStmt.all(projectId);
    
    return {
      stats,
      categories,
      recentFAQs,
      period
    };
  }

  async exportFAQs(projectId: string, format: string, category?: string) {
    let whereClause = 'WHERE project_id = ?';
    const params: any[] = [projectId];
    
    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }
    
    const stmt = databaseService.db.prepare(`
      SELECT * FROM faqs ${whereClause} ORDER BY created_at DESC
    `);
    const faqs = stmt.all(...params);
    
    switch (format) {
      case 'json':
        return {
          contentType: 'application/json',
          data: JSON.stringify(faqs, null, 2)
        };
      case 'csv':
        const csv = this.convertToCSV(faqs);
        return {
          contentType: 'text/csv',
          data: csv
        };
      case 'pdf':
        // PDF generation would require additional library
        throw new Error('PDF export not implemented yet');
      default:
        throw new Error('Unsupported export format');
    }
  }

  async getFAQsCategories(projectId: string) {
    const stmt = databaseService.db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM faqs 
      WHERE project_id = ? AND category IS NOT NULL
      GROUP BY category 
      ORDER BY count DESC
    `);
    return stmt.all(projectId);
  }

  async updateFAQCategory(faqId: string, category: string) {
    const stmt = databaseService.db.prepare(`
      UPDATE faqs SET category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `);
    return stmt.run(category, faqId);
  }

  private convertToCSV(faqs: any[]): string {
    if (faqs.length === 0) return '';
    
    const headers = ['ID', 'Question', 'Answer', 'Category', 'Created At', 'Updated At'];
    const csvRows = [headers.join(',')];
    
    for (const faq of faqs) {
      const row = [
        faq.id,
        `"${faq.question.replace(/"/g, '""')}"`,
        `"${faq.answer.replace(/"/g, '""')}"`,
        faq.category || '',
        faq.created_at,
        faq.updated_at
      ];
      csvRows.push(row.join(','));
    }
    
    return csvRows.join('\n');
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
