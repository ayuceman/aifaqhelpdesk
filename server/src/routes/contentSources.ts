import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/authMiddleware';
import { FileParser } from '../services/fileParser';
import { llmService } from '../services/llmService';
import { storageService } from '../services/storageService';
import { faqService } from '../services/faqService';
import { databaseService } from '../services/databaseService';

const router = express.Router();

// Configure multer for file uploads (using disk storage like the existing route)
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
  storage: storage,
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

// Get all content sources for a project
router.get('/:projectId/sources', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const sources = databaseService.getContentSources(projectId);
    
    res.json({
      success: true,
      sources: sources.map(source => ({
        id: source.id,
        type: source.type,
        name: source.name,
        content: source.content,
        file_size: source.file_size,
        url: source.url,
        created_at: source.created_at,
        metadata: source.metadata
      }))
    });
  } catch (error) {
    console.error('Get content sources error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch content sources'
    });
  }
});

// Upload file content source
router.post('/:projectId/sources/file', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const filePath = file.path;
    const filename = file.originalname;

    // Parse the uploaded file using the same logic as the existing route
    const parsedContent = await FileParser.parseFile(filePath, filename);

    // Clean up uploaded file (same as existing route)
    fs.unlinkSync(filePath);

    if (!parsedContent.text || parsedContent.text.length < 100) {
      return res.status(400).json({ error: 'File content is too short or could not be extracted' });
    }

    // Store the content source in database
    const sourceId = databaseService.generateId();
    
    databaseService.createContentSource({
      id: sourceId,
      projectId,
      type: 'file',
      name: filename,
      content: parsedContent.text,
      fileSize: file.size,
      metadata: {
        fileName: filename,
        mimeType: file.mimetype,
        ...parsedContent.metadata
      }
    });
    
    res.json({
      success: true,
      sourceId,
      content: parsedContent.text,
      metadata: {
        fileName: filename,
        fileSize: file.size,
        mimeType: file.mimetype,
        ...parsedContent.metadata
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to process file'
    });
  }
});

// Crawl URL content source
router.post('/:projectId/sources/url', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { url, depth = 1 } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Validate depth (1-3 levels)
    const crawlDepth = Math.min(Math.max(parseInt(depth) || 1, 1), 3);
    
    // Crawl the website using the same logic as the existing route
    const parsedContent = await FileParser.parseURL(url, crawlDepth);
    
    if (!parsedContent.text || parsedContent.text.length < 100) {
      return res.status(400).json({ error: 'Could not extract sufficient content from the URL' });
    }

    // Store the content source in database
    const sourceId = databaseService.generateId();
    
    databaseService.createContentSource({
      id: sourceId,
      projectId,
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
    
    res.json({
      success: true,
      sourceId,
      content: parsedContent.text,
      metadata: {
        url,
        pagesCrawled: parsedContent.metadata?.pagesCrawled || 1,
        crawlDepth: crawlDepth
      }
    });
  } catch (error) {
    console.error('URL crawl error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to crawl URL'
    });
  }
});

// Delete content source
router.delete('/:projectId/sources/:sourceId', authenticateToken, async (req, res) => {
  try {
    const { projectId, sourceId } = req.params;
    
    databaseService.deleteContentSource(sourceId);
    
    res.json({
      success: true,
      message: 'Content source deleted successfully'
    });
  } catch (error) {
    console.error('Delete content source error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to delete content source'
    });
  }
});

// Generate FAQs from all content sources
router.post('/:projectId/generate-faqs', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { tone = 'friendly', maxQuestions = 15 } = req.body;
    
    // Get all content sources for the project
    const sources = databaseService.getContentSources(projectId);
    
    if (sources.length === 0) {
      return res.status(400).json({ error: 'No content sources available to generate FAQs from' });
    }

    // Combine all content from sources
    const combinedContent = sources.map(source => source.content).join('\n\n');
    
    if (combinedContent.length < 100) {
      return res.status(400).json({ error: 'Combined content is too short to generate FAQs' });
    }

    // Generate FAQs from the combined content
    const faqResult = await llmService.generateFAQ(combinedContent, tone, maxQuestions);
    
    // Save the generated FAQs using bulk method for better performance
    let createdFAQs = [];
    if (faqResult.faqs && faqResult.faqs.length > 0) {
      try {
        createdFAQs = await faqService.bulkCreateFAQs(projectId, faqResult.faqs);
        console.log(`Successfully created ${createdFAQs.length} FAQs for project ${projectId}`);
      } catch (error) {
        console.error('Error creating FAQs:', error);
        // Continue with response even if some FAQs failed to create
      }
    }

    res.json({
      success: true,
      faqs: faqResult.faqs,
      count: faqResult.faqs.length,
      created: createdFAQs.length
    });
  } catch (error) {
    console.error('Generate FAQs error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate FAQs'
    });
  }
});

// Preview content source
router.get('/:projectId/sources/:sourceId/preview', authenticateToken, async (req, res) => {
  try {
    const { projectId, sourceId } = req.params;
    
    // In a real implementation, you'd fetch the content source from database
    // For now, we'll return a simple preview page
    
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Content Preview</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .content { white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h1>Content Preview</h1>
        <p>Content source ID: ${sourceId}</p>
        <div class="content">Content preview would be shown here...</div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Preview content error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to preview content'
    });
  }
});

export { router as contentSourcesRoutes };
