import express from 'express';
import { faqService } from '../services/faqService';
import { databaseService } from '../services/databaseService';
import { llmService } from '../services/llmService';

type EmbeddingRecord = {
  id: string;
  text: string;
  embedding: number[];
  faqId?: string;
  similarity?: number;
};

const router = express.Router();

// Helper function to provide friendly fallback responses
function getFriendlyFallback(question: string): string {
  const lowerQuestion = question.toLowerCase().trim();
  
  // Check for greetings
  const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
  if (greetings.some(greeting => lowerQuestion === greeting || lowerQuestion.startsWith(greeting + ' ') || lowerQuestion.startsWith(greeting + ','))) {
    return "Hello! 👋 How can I help you today? Feel free to ask me any questions about our services, features, or anything else you'd like to know!";
  }
  
  // Check for "how are you" type questions
  if (lowerQuestion.includes('how are you') || lowerQuestion.includes('how r u')) {
    return "I'm doing great, thank you for asking! 😊 I'm here to help answer your questions. What would you like to know?";
  }
  
  // Check for "thank you"
  if (lowerQuestion.includes('thank') || lowerQuestion.includes('thanks')) {
    return "You're welcome! Is there anything else I can help you with?";
  }
  
  // Check for help requests
  if (lowerQuestion.includes('help') && lowerQuestion.length < 20) {
    return "I'm here to help! You can ask me questions about our services, features, pricing, or anything else. What would you like to know?";
  }
  
  // Default friendly response
  return "I'm here to help! While I couldn't find a specific answer to your question in my knowledge base, feel free to rephrase your question or ask about something else. You can also contact our support team for more detailed assistance. What else would you like to know?";
}

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
    const projectData = databaseService.getProjectBySlugPublic(project);
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
    const { question, project = 'default', threshold = 0.3, topK = 5 } = req.body;
    
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
      const projectData = databaseService.getProjectBySlugPublic(project);
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

    console.log(`[CHAT] Found ${embeddings.length} embeddings for project ${project}`);
    if (embeddings.length > 0) {
      console.log(`[CHAT] First embedding sample:`, {
        id: embeddings[0].id,
        text: embeddings[0].text.substring(0, 50) + '...',
        embeddingLength: embeddings[0].embedding.length,
        faqId: embeddings[0].faqId
      });
    }

    // Calculate similarities
    const similarities: EmbeddingRecord[] = (embeddings as any[]).map((emb: any) => {
      // Parse the embedding from JSON string to array
      const embeddingArray = typeof emb.embedding === 'string' 
        ? JSON.parse(emb.embedding) 
        : emb.embedding;
      
      console.log(`[CHAT] Embedding type: ${typeof emb.embedding}, Array length: ${embeddingArray.length}, Query length: ${queryEmbedding.embedding.length}`);
      console.log(`[CHAT] First few query values:`, queryEmbedding.embedding.slice(0, 3));
      console.log(`[CHAT] First few embedding values:`, embeddingArray.slice(0, 3));
      
      const similarity = cosineSimilarity(queryEmbedding.embedding, embeddingArray);
      return {
        id: emb.id,
        text: emb.text,
        embedding: embeddingArray,
        faqId: emb.faqId,
        similarity
      } as EmbeddingRecord;
    });

    console.log(`[CHAT] Calculated similarities for ${similarities.length} embeddings`);
    console.log(`[CHAT] Top 3 similarities:`, [...similarities]
      .sort((a: EmbeddingRecord, b: EmbeddingRecord) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, 3)
      .map((s: EmbeddingRecord) => ({ text: s.text.substring(0, 50) + '...', similarity: s.similarity }))
    );

    // Sort by similarity and get top results
    const topResults = [...similarities]
      .sort((a: EmbeddingRecord, b: EmbeddingRecord) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, topK);

    console.log(`[CHAT] Top ${topResults.length} results found`);
  console.log('[CHAT] Top results details:', topResults.map(r => ({ id: r.id, faqId: r.faqId, similarity: r.similarity })));

    // Check if we have a good match
    const bestMatch = topResults[0];
    const bestSimilarity = bestMatch ? (bestMatch.similarity || 0) : 0;
    if (bestMatch && bestSimilarity >= threshold) {
      console.log(`[CHAT] Found good match with similarity ${bestSimilarity.toFixed(3)}`);
      
      // Find the FAQ for this match
  const matchedFAQ = faqs.find((faq: any) => faq.id === bestMatch.faqId);
      if (matchedFAQ) {
        return res.json({
          success: true,
          answer: matchedFAQ.answer,
          question: matchedFAQ.question,
          source: 'faq_match',
          confidence: bestMatch.similarity,
          processingTime: Date.now() - startTime
        });
      } else {
        // Frequently demo embeddings have faqId values that don't match demo faqs (different ID schemes).
        // Fallback: return the embedding text snippet so the widget still provides a helpful response.
        console.warn(`[CHAT] Best match faqId ${bestMatch.faqId} not found for project ${project}. Using embedding text fallback.`);
        return res.json({
          success: true,
          answer: bestMatch.text || "I found related content but couldn't map it to a saved FAQ.",
          question: null,
          source: 'embedding_text_fallback',
          confidence: bestMatch.similarity,
          processingTime: Date.now() - startTime
        });
      }
    }

    // If no good match, use LLM to generate answer from context
  console.log(`[CHAT] No good match found (bestSimilarity=${bestSimilarity.toFixed(3)}), using LLM with context`);
    
    const contextFAQs = topResults
      .filter((result: EmbeddingRecord) => (result.similarity || 0) > 0.3) // Lower threshold for context
      .map((result: EmbeddingRecord) => {
        const faq = faqs.find((f: any) => f.id === result.faqId);
        // If no FAQ matches the faqId, use the embedding text as context snippet
        return faq ? `Q: ${faq.question}\nA: ${faq.answer}` : `Context snippet: ${result.text}`;
      })
      .filter(Boolean)
      .slice(0, 3);

    if (contextFAQs.length > 0) {
      const context = contextFAQs.join('\n\n');
      console.log('[CHAT] Context provided to LLM:', context);
      const prompt = `Based on the following FAQ context, please provide a helpful answer to the user's question. If the question isn't directly covered, provide the most relevant information available.

Context:
${context}

User Question: ${question}

Please provide a concise and helpful answer:`;

      try {
        const llmAnswer = await llmService.generateAnswer(question, [context]);
        console.log('[CHAT] LLM answer:', llmAnswer && llmAnswer.substring ? llmAnswer.substring(0, 500) : llmAnswer);

        if (typeof llmAnswer === 'string' && llmAnswer.trim().length > 0) {
          return res.json({
            success: true,
            answer: llmAnswer,
            source: 'llm_generated',
            confidence: 0.7,
            processingTime: Date.now() - startTime
          });
        } else {
          console.warn('[CHAT] LLM returned empty or whitespace-only response');
        }
      } catch (llmError) {
        console.error('[CHAT] LLM generation failed:', llmError);
      }
    }

    // Fallback response - provide a friendly greeting or helpful message
    const friendlyFallback = getFriendlyFallback(question);
    return res.json({
      success: true,
      answer: friendlyFallback,
      source: 'friendly_fallback',
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
  // If lengths differ, compute similarity on the common prefix and log the discrepancy
  const minLen = Math.min(a.length, b.length);
  if (minLen === 0) return 0;
  if (a.length !== b.length) {
    console.warn(`[CHAT] Embedding length mismatch: a=${a.length}, b=${b.length}. Using prefix length ${minLen} for similarity.`);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < minLen; i++) {
    const ai = Number(a[i]) || 0;
    const bi = Number(b[i]) || 0;
    dotProduct += ai * bi;
    normA += ai * ai;
    normB += bi * bi;
  }

  if (normA === 0 || normB === 0) return 0;

  const sim = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  if (!isFinite(sim) || isNaN(sim)) return 0;
  return sim;
}

export { router as publicRoutes };