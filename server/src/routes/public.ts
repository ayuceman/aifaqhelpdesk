import express from 'express';
import { storageService } from '../services/storageService';
import { llmService } from '../services/llmService';
import { trialService } from '../services/trialService';
import { checkChatLimit } from '../middleware/trialMiddleware';

const router = express.Router();

// Get all FAQs for public access (with project support)
router.get('/faq', async (req, res) => {
  try {
    const project = (req.query.project as string) || 'default';
    const faqs = await storageService.getFAQs(project);
    res.json({ success: true, faqs, project });
  } catch (error) {
    console.error('Get public FAQs error:', error);
    res.status(500).json({ error: 'Failed to get FAQs' });
  }
});

// Chat endpoint for widget (with project support)
router.post('/chat', checkChatLimit, async (req, res) => {
  try {
    const { question, project = 'default', threshold = 0.5, topK = 5 } = req.body;
    
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    const startTime = Date.now();
    console.log(`[CHAT] Request: "${question}" | Project: ${project} | IP: ${req.ip}`);

    // Increment chat count for trial
    await trialService.incrementChatCount(project);

    // Generate embedding for the question
    const queryEmbedding = await llmService.generateEmbedding(question);
    console.log(`[CHAT] Embedding generated (length: ${queryEmbedding.embedding.length}) in ${Date.now() - startTime}ms`);
    
    // Find similar FAQs with lower threshold for better matching
    const matches = await storageService.findSimilarEmbeddings(
      queryEmbedding.embedding, 
      topK, 
      threshold,
      project
    );

    console.log(`[CHAT] Found ${matches.length} matches:`, matches.map(m => ({ q: m.faq.question.substring(0, 40), score: m.score.toFixed(3) })));

    // Fallback: if no embedding matches, try intelligent keyword search
    if (matches.length === 0) {
      console.log('[CHAT] No embedding matches, trying keyword search...');
      const allFAQs = await storageService.getFAQs(project);
      
      // Extract meaningful keywords (filter out common words)
      const stopWords = new Set(['what', 'when', 'where', 'who', 'how', 'why', 'which', 'the', 'is', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'about', 'this', 'that', 'these', 'those']);
      const keywords = question.toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w));
      
      console.log('Keywords extracted:', keywords);
      
      const keywordMatches = allFAQs
        .map(faq => {
          const questionText = faq.question.toLowerCase();
          const answerText = faq.answer.toLowerCase();
          
          // Score based on keyword presence in question (higher weight) and answer
          let score = 0;
          keywords.forEach(kw => {
            if (questionText.includes(kw)) score += 2; // Higher weight for question matches
            if (answerText.includes(kw)) score += 1;   // Lower weight for answer matches
          });
          
          // Normalize by number of keywords
          score = keywords.length > 0 ? score / (keywords.length * 3) : 0;
          
          return { faq, score };
        })
        .filter(m => m.score > 0.15) // Lower threshold for more results
        .sort((a, b) => b.score - a.score)
        .slice(0, 5); // Get top 5 matches
      
      console.log(`[CHAT] Keyword matches: ${keywordMatches.length}`, keywordMatches.map(m => ({ q: m.faq.question.substring(0, 40), score: m.score.toFixed(2) })));
      
      if (keywordMatches.length > 0) {
        // Always use LLM to generate contextual answer from matches
        try {
          const context = keywordMatches.map(m => 
            `Q: ${m.faq.question}\nA: ${m.faq.answer}`
          ).join('\n\n');
          
          console.log(`[CHAT] Generating answer from ${keywordMatches.length} keyword matches using LLM`);
          const generatedAnswer = await llmService.generateAnswer(question, [context]);
          
          const totalTime = Date.now() - startTime;
          console.log(`[CHAT] Response: keyword_llm | Confidence: ${keywordMatches[0].score.toFixed(2)} | Time: ${totalTime}ms`);
          
          return res.json({
            success: true,
            answer: generatedAnswer,
            source: 'keyword_llm',
            confidence: keywordMatches[0].score,
            relatedFAQs: keywordMatches.map(m => ({
              question: m.faq.question,
              answer: m.faq.answer,
              score: m.score
            }))
          });
        } catch (error) {
          console.error('LLM generation failed, returning best match:', error);
          return res.json({
            success: true,
            answer: keywordMatches[0].faq.answer,
            source: 'keyword_direct',
            confidence: keywordMatches[0].score
          });
        }
      }
      
      return res.json({
        success: true,
        answer: "I couldn't find a relevant answer to your question. Please try rephrasing your question or contact support for more specific help.",
        source: 'no_match',
        confidence: 0
      });
    }

    // If we have good matches, return the best one
    const bestMatch = matches[0];
    
    // Lower threshold for direct match (was 0.9, now 0.75)
    if (bestMatch.score >= 0.75) {
      const totalTime = Date.now() - startTime;
      console.log(`[CHAT] Response: faq_match | Confidence: ${bestMatch.score.toFixed(2)} | Time: ${totalTime}ms`);
      
      return res.json({
        success: true,
        answer: bestMatch.faq.answer,
        source: 'faq_match',
        confidence: bestMatch.score,
        faq: {
          question: bestMatch.faq.question,
          answer: bestMatch.faq.answer
        }
      });
    }

    // If confidence is moderate, try to generate a better answer using context
    try {
      console.log(`[CHAT] Generating contextual answer from ${matches.length} embedding matches`);
      const context = matches.map(match => 
        `Q: ${match.faq.question}\nA: ${match.faq.answer}`
      ).join('\n\n');
      
      const generatedAnswer = await llmService.generateAnswer(question, [context]);
      
      const totalTime = Date.now() - startTime;
      console.log(`[CHAT] Response: generated | Confidence: ${bestMatch.score.toFixed(2)} | Time: ${totalTime}ms`);
      
      return res.json({
        success: true,
        answer: generatedAnswer,
        source: 'generated',
        confidence: bestMatch.score,
        relatedFAQs: matches.map(match => ({
          question: match.faq.question,
          answer: match.faq.answer,
          score: match.score
        }))
      });
    } catch (llmError) {
      // Fallback to best match if LLM generation fails
      return res.json({
        success: true,
        answer: bestMatch.faq.answer,
        source: 'faq_match_fallback',
        confidence: bestMatch.score,
        faq: {
          question: bestMatch.faq.question,
          answer: bestMatch.faq.answer
        }
      });
    }
  } catch (error) {
    console.error('[CHAT] Error:', error);
    res.status(500).json({ 
      error: 'Failed to process your question. Please try again.',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@yourcompany.com'
    });
  }
});

export { router as publicRoutes };
