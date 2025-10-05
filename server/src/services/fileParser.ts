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

  static async parseURL(url: string, depth: number = 1): Promise<ParsedContent> {
    try {
      const visitedUrls = new Set<string>();
      const allContent: string[] = [];
      const allTitles: string[] = [];
      let totalWordCount = 0;

      const crawlPage = async (currentUrl: string, currentDepth: number): Promise<void> => {
        if (currentDepth > depth || visitedUrls.has(currentUrl)) {
          return;
        }

        visitedUrls.add(currentUrl);
        console.log(`[CRAWL] Crawling: ${currentUrl} (depth: ${currentDepth})`);

        try {
          const response = await axios.get(currentUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Accept-Encoding': 'gzip, deflate',
              'Connection': 'keep-alive',
            },
            timeout: 15000,
            maxRedirects: 5,
          });

          const $ = cheerio.load(response.data);
          
          // Remove all non-content elements
          $('script, style, noscript, iframe, object, embed, form, input, button, select, textarea').remove();
          $('nav, header, footer, aside, .navigation, .nav, .menu, .sidebar').remove();
          $('.advertisement, .ads, .ad, .banner, .promo, .sponsor').remove();
          $('.social, .share, .comments, .comment, .related, .recommended').remove();
          $('.cookie, .privacy, .terms, .legal').remove();
          $('.search, .filter, .sort, .pagination').remove();
          $('meta, link, title').remove();
          
          // Extract meaningful content
          let pageContent = '';
          let pageTitle = '';
          
          // Try multiple content selectors in order of preference
          const contentSelectors = [
            'main article',
            'main .content',
            'article',
            '.content',
            '.post',
            '.entry',
            '.article',
            '.main-content',
            '.page-content',
            'main',
            '.container .content',
            '#content',
            '.wrapper .content'
          ];
          
          let contentFound = false;
          for (const selector of contentSelectors) {
            const content = $(selector).first();
            if (content.length > 0 && content.text().trim().length > 100) {
              pageContent = content.text();
              contentFound = true;
              break;
            }
          }
          
          // Fallback to body if no main content found
          if (!contentFound) {
            pageContent = $('body').text();
          }
          
          // Extract title
          pageTitle = $('title').text() || $('h1').first().text() || 'Untitled';
          
          // Clean up content
          pageContent = pageContent
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, '\n')
            .trim();
          
          // Filter out very short or low-quality content
          if (pageContent.length > 200) {
            allContent.push(`\n--- Page: ${pageTitle} (${currentUrl}) ---\n${pageContent}`);
            allTitles.push(pageTitle);
            totalWordCount += pageContent.split(/\s+/).length;
            
            console.log(`[CRAWL] Extracted ${pageContent.length} chars from ${currentUrl}`);
          }
          
          // Find links for next depth level
          if (currentDepth < depth) {
            const baseUrl = new URL(currentUrl);
            const links: string[] = [];
            
            $('a[href]').each((_, element) => {
              const href = $(element).attr('href');
              if (href) {
                try {
                  // Convert relative URLs to absolute
                  const absoluteUrl = new URL(href, currentUrl).href;
                  
                  // Only crawl same domain
                  if (absoluteUrl.startsWith(baseUrl.origin)) {
                    // Avoid common non-content pages
                    const pathname = new URL(absoluteUrl).pathname.toLowerCase();
                    const skipPatterns = [
                      '/admin', '/login', '/register', '/signup', '/signin',
                      '/api/', '/ajax/', '/json/', '/xml/', '/rss/', '/feed/',
                      '/search', '/filter', '/sort', '/tag/', '/category/',
                      '/user/', '/profile/', '/account/', '/dashboard/',
                      '/cart/', '/checkout/', '/payment/', '/billing/',
                      '/download/', '/file/', '/attachment/',
                      '/print/', '/pdf/', '/export/',
                      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
                      '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico',
                      '.css', '.js', '.json', '.xml'
                    ];
                    
                    const shouldSkip = skipPatterns.some(pattern => 
                      pathname.includes(pattern) || absoluteUrl.includes(pattern)
                    );
                    
                    if (!shouldSkip && !visitedUrls.has(absoluteUrl)) {
                      links.push(absoluteUrl);
                    }
                  }
                } catch (e) {
                  // Skip invalid URLs
                }
              }
            });
            
            // Limit to 5 links per page to avoid overwhelming
            const limitedLinks = links.slice(0, 5);
            
            // Crawl found links
            for (const link of limitedLinks) {
              await crawlPage(link, currentDepth + 1);
            }
          }
          
        } catch (error) {
          console.error(`[CRAWL] Error crawling ${currentUrl}:`, error);
        }
      };

      // Start crawling from the main URL
      await crawlPage(url, 1);
      
      if (allContent.length === 0) {
        throw new Error('No meaningful content found on the website');
      }
      
      const combinedContent = allContent.join('\n\n');
      const mainTitle = allTitles[0] || 'Untitled';
      
      console.log(`[CRAWL] Completed: ${visitedUrls.size} pages, ${totalWordCount} words`);
      
      return {
        text: combinedContent,
        metadata: {
          title: mainTitle,
          wordCount: totalWordCount,
          pagesCrawled: visitedUrls.size,
          urls: Array.from(visitedUrls),
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
