import express from 'express';
import { faqService } from '../services/faqService';
import { databaseService } from '../services/databaseService';
import { llmService } from '../services/llmService';

const router = express.Router();

// Get all FAQs for public access (with project support)
router.get('/faq', async (req, res) => {
  try {
    const project = req.query.project as string || 'default';
    
    // For demo project, use the old system
    if (project === 'demo') {
      const fs = require('fs');
      const path = require('path');
      const demoPath = path.join(process.cwd(), 'data', 'projects', 'demo', 'faq.json');
      
      if (fs.existsSync(demoPath)) {
        const data = fs.readFileSync(demoPath, 'utf8');
        const faqs = JSON.parse(data);
        return res.json({ success: true, faqs, project });
      }
    }
    
    // For other projects, find by slug
    const projectData = databaseService.getProjectBySlug('', project);
    if (!projectData) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const faqs = await faqService.getFAQs(projectData.id);
    res.json({ success: true, faqs, project });
  } catch (error) {
    console.error('Get public FAQs error:', error);
    res.status(500).json({ error: 'Failed to get FAQs' });
  }
});

// Chat endpoint for widget (with project support)
router.post('/chat', async (req, res) => {
  try {
    const { question, project = 'default', threshold = 0.5, topK = 5 } = req.body;
    
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    const startTime = Date.now();
    console.log(`[CHAT] Request: "${question}" | Project: ${project} | IP: ${req.ip}`);

    // Generate embedding for the question
    const queryEmbedding = await llmService.generateEmbedding(question);
    console.log(`[CHAT] Embedding generated (length: ${queryEmbedding.embedding.length}) in ${Date.now() - startTime}ms`);

    let embeddings = [];
    let faqs = [];

    // Handle demo project
    if (project === 'demo') {
      const fs = require('fs');
      const path = require('path');
      const demoFaqPath = path.join(process.cwd(), 'data', 'projects', 'demo', 'faq.json');
      const demoEmbedPath = path.join(process.cwd(), 'data', 'projects', 'demo', 'embeddings.json');
      
      if (fs.existsSync(demoFaqPath) && fs.existsSync(demoEmbedPath)) {
        const faqData = fs.readFileSync(demoFaqPath, 'utf8');
        const embedData = fs.readFileSync(demoEmbedPath, 'utf8');
        faqs = JSON.parse(faqData);
        embeddings = JSON.parse(embedData);
      }
    } else {
      // Handle database projects
      const projectData = databaseService.getProjectBySlug('', project);
      if (projectData) {
        faqs = await faqService.getFAQs(projectData.id);
        const embedData = await faqService.getEmbeddings(projectData.id);
        embeddings = embedData.map(emb => ({
          id: emb.id,
          text: emb.text,
          embedding: emb.embedding,
          faqId: emb.faqId
        }));
      }
    }

    if (embeddings.length === 0) {
      console.log(`[CHAT] No embeddings found for project ${project}`);
      return res.json({
        success: true,
        answer: "I couldn't find any relevant information to answer your question. Please try rephrasing your question or contact support for more specific help.",
        source: 'no_data',
        confidence: 0,
        processingTime: Date.now() - startTime
      });
    }

    // Calculate similarities
    const similarities = embeddings.map(emb => {
      const similarity = cosineSimilarity(queryEmbedding.embedding, emb.embedding);
      return {
        ...emb,
        similarity
      };
    });

    // Sort by similarity and get top results
    const topResults = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    console.log(`[CHAT] Top ${topResults.length} results found`);

    // Check if we have a good match
    const bestMatch = topResults[0];
    if (bestMatch && bestMatch.similarity >= threshold) {
      console.log(`[CHAT] Found good match with similarity ${bestMatch.similarity.toFixed(3)}`);
      
      // Find the FAQ for this match
      const matchedFAQ = faqs.find(faq => faq.id === bestMatch.faqId);
      if (matchedFAQ) {
        return res.json({
          success: true,
          answer: matchedFAQ.answer,
          question: matchedFAQ.question,
          source: 'faq_match',
          confidence: bestMatch.similarity,
          processingTime: Date.now() - startTime
        });
      }
    }

    // If no good match, use LLM to generate answer from context
    console.log(`[CHAT] No good match found, using LLM with context`);
    
    const contextFAQs = topResults
      .filter(result => result.similarity > 0.3) // Lower threshold for context
      .map(result => {
        const faq = faqs.find(f => f.id === result.faqId);
        return faq ? `Q: ${faq.question}\nA: ${faq.answer}` : null;
      })
      .filter(Boolean)
      .slice(0, 3);

    if (contextFAQs.length > 0) {
      const context = contextFAQs.join('\n\n');
      const prompt = `Based on the following FAQ context, please provide a helpful answer to the user's question. If the question isn't directly covered, provide the most relevant information available.

Context:
${context}

User Question: ${question}

Please provide a concise and helpful answer:`;

      try {
        const llmResponse = await llmService.generateChatCompletion([
          { role: 'user', content: prompt }
        ]);

        return res.json({
          success: true,
          answer: llmResponse.content,
          source: 'llm_generated',
          confidence: 0.7,
          processingTime: Date.now() - startTime
        });
      } catch (llmError) {
        console.error('[CHAT] LLM generation failed:', llmError);
      }
    }

    // Fallback response
    return res.json({
      success: true,
      answer: "I couldn't find a relevant answer to your question. Please try rephrasing your question or contact support for more specific help.",
      source: 'no_match',
      confidence: 0,
      processingTime: Date.now() - startTime
    });

  } catch (error) {
    console.error('[CHAT] Error:', error);
    res.status(500).json({ 
      error: 'Failed to process your question. Please try again later.',
      processingTime: Date.now() - Date.now()
    });
  }
});

// Helper function for cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export { router as publicRoutes };