import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { marked } from 'marked';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ParsedContent {
  text: string;
  metadata?: {
    title?: string;
    author?: string;
    pages?: number;
    wordCount?: number;
  };
}

export class FileParser {
  static async parsePDF(filePath: string): Promise<ParsedContent> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      
      return {
        text: data.text,
        metadata: {
          title: data.info?.Title,
          author: data.info?.Author,
          pages: data.numpages,
          wordCount: data.text.split(/\s+/).length,
        }
      };
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error}`);
    }
  }

  static async parseDOCX(filePath: string): Promise<ParsedContent> {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      
      return {
        text: result.value,
        metadata: {
          wordCount: result.value.split(/\s+/).length,
        }
      };
    } catch (error) {
      throw new Error(`Failed to parse DOCX: ${error}`);
    }
  }

  static async parseTXT(filePath: string): Promise<ParsedContent> {
    try {
      const text = fs.readFileSync(filePath, 'utf-8');
      
      return {
        text,
        metadata: {
          wordCount: text.split(/\s+/).length,
        }
      };
    } catch (error) {
      throw new Error(`Failed to parse TXT: ${error}`);
    }
  }

  static async parseMarkdown(filePath: string): Promise<ParsedContent> {
    try {
      const markdown = fs.readFileSync(filePath, 'utf-8');
      const html = marked(markdown);
      
      // Strip HTML tags to get plain text
      const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      
      return {
        text,
        metadata: {
          wordCount: text.split(/\s+/).length,
        }
      };
    } catch (error) {
      throw new Error(`Failed to parse Markdown: ${error}`);
    }
  }

  static async parseURL(url: string): Promise<ParsedContent> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      
      // Remove script, style, and other non-content elements
      $('script, style, nav, header, footer, aside, .advertisement, .ads').remove();
      
      // Extract main content
      let text = '';
      
      // Try to find main content area
      const mainContent = $('main, article, .content, .post, .entry').first();
      if (mainContent.length > 0) {
        text = mainContent.text();
      } else {
        // Fallback to body text
        text = $('body').text();
      }
      
      // Clean up text
      text = text
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();
      
      const title = $('title').text() || $('h1').first().text() || 'Untitled';
      
      return {
        text,
        metadata: {
          title,
          wordCount: text.split(/\s+/).length,
        }
      };
    } catch (error) {
      throw new Error(`Failed to parse URL: ${error}`);
    }
  }

  static getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase();
  }

  static async parseFile(filePath: string, filename: string): Promise<ParsedContent> {
    const extension = this.getFileExtension(filename);
    
    switch (extension) {
      case '.pdf':
        return this.parsePDF(filePath);
      case '.docx':
        return this.parseDOCX(filePath);
      case '.txt':
        return this.parseTXT(filePath);
      case '.md':
      case '.markdown':
        return this.parseMarkdown(filePath);
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  }
}
