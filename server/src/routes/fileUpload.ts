import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { FileParser } from '../services/fileParser';
import { llmService } from '../services/llmService';
import { databaseService } from '../services/databaseService';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.txt', '.md', '.markdown'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not allowed. Allowed types: ${allowedTypes.join(', ')}`));
    }
  }
});

// Upload file and parse content
router.post('/file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const filename = req.file.originalname;

    // Parse the uploaded file
    const parsedContent = await FileParser.parseFile(filePath, filename);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Also save to content sources database if projectId is provided
    if (req.body.projectId) {
      try {
        const sourceId = databaseService.generateId();
        databaseService.createContentSource({
          id: sourceId,
          projectId: req.body.projectId,
          type: 'file',
          name: filename,
          content: parsedContent.text,
          fileSize: req.file.size,
          metadata: {
            fileName: filename,
            mimeType: req.file.mimetype,
            ...parsedContent.metadata
          }
        });
      } catch (error) {
        console.log('Note: Could not save to content sources database:', error);
      }
    }

    res.json({
      success: true,
      content: parsedContent.text,
      metadata: parsedContent.metadata,
      filename
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to process file' 
    });
  }
});

// Crawl URL and extract content
router.post('/url', async (req, res) => {
  try {
    console.log('[CRAWL] Request received:', req.body);
    const { url, depth = 1 } = req.body;
    
    if (!url) {
      console.log('[CRAWL] No URL provided');
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      console.log('[CRAWL] Invalid URL format:', url);
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Validate depth (1-3 levels)
    const crawlDepth = Math.min(Math.max(parseInt(depth) || 1, 1), 3);
    
    console.log(`[CRAWL] Starting crawl: ${url} (depth: ${crawlDepth})`);
    
    const parsedContent = await FileParser.parseURL(url, crawlDepth);

    console.log(`[CRAWL] Success: ${parsedContent.text.length} chars extracted`);
    
    // Also save to content sources database if projectId is provided
    if (req.body.projectId) {
      try {
        const sourceId = databaseService.generateId();
        databaseService.createContentSource({
          id: sourceId,
          projectId: req.body.projectId,
          type: 'url',
          name: url,
          content: parsedContent.text,
          url: url,
          metadata: {
            url,
            pagesCrawled: parsedContent.metadata?.pagesCrawled || 1,
            crawlDepth: crawlDepth
          }
        });
      } catch (error) {
        console.log('Note: Could not save to content sources database:', error);
      }
    }
    
    res.json({
      success: true,
      content: parsedContent.text,
      metadata: parsedContent.metadata,
      url,
      depth: crawlDepth
    });
  } catch (error) {
    console.error('URL crawling error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to crawl URL' 
    });
  }
});

// Generate FAQ from content
router.post('/generate-faq', async (req, res) => {
  try {
    const { content, tone = 'friendly', maxQuestions = 15 } = req.body;
    
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (content.length < 100) {
      return res.status(400).json({ error: 'Content must be at least 100 characters long' });
    }

    if (!['formal', 'concise', 'friendly'].includes(tone)) {
      return res.status(400).json({ error: 'Tone must be one of: formal, concise, friendly' });
    }

    if (typeof maxQuestions !== 'number' || maxQuestions < 1 || maxQuestions > 50) {
      return res.status(400).json({ error: 'Max questions must be between 1 and 50' });
    }

    const faqResult = await llmService.generateFAQ(content, tone, maxQuestions);

    res.json({
      success: true,
      faqs: faqResult.faqs
    });
  } catch (error) {
    console.error('FAQ generation error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate FAQ' 
    });
  }
});

export { router as fileUploadRoutes };
