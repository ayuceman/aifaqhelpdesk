import React, { useState } from 'react';
import axios from 'axios';

interface UploadPanelProps {
  onContentExtracted: (content: string) => void;
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
  };
}

interface ParsedFile {
  name: string;
  size: number;
  content: string;
  wordCount: number;
}

export const UploadPanel: React.FC<UploadPanelProps> = ({ onContentExtracted, toast }) => {
  const [mode, setMode] = useState<'file' | 'url'>('file');
  const [files, setFiles] = useState<File[]>([]);
  const [url, setUrl] = useState('');
  const [crawlDepth, setCrawlDepth] = useState(1);
  const [loading, setLoading] = useState(false);
  const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([]);
  const [urlContent, setUrlContent] = useState<{ content: string; charCount: number; pagesCrawled?: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setParsedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadFiles = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    setLoading(true);
    const parsed: ParsedFile[] = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axios.post('http://localhost:3001/api/upload/file', formData);
        
        if (response.data.success) {
          parsed.push({
            name: file.name,
            size: file.size,
            content: response.data.content,
            wordCount: response.data.metadata?.wordCount || 0,
          });
        }
      }

      setParsedFiles(parsed);
      const combinedContent = parsed.map(p => p.content).join('\n\n');
      onContentExtracted(combinedContent);
    } catch (err: any) {
      console.error('File upload error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to upload files';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchURL = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting URL crawl:', { url, depth: crawlDepth });
      toast.info(`Crawling website with depth ${crawlDepth}...`);
      
      const requestData = { 
        url: url.trim(), 
        depth: crawlDepth 
      };
      console.log('Request data:', requestData);
      
      const response = await axios.post('http://localhost:3001/api/upload/url', requestData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 second timeout for crawling
      });
      
      console.log('Response received:', response.data);
      
      if (response.data.success) {
        const content = response.data.content;
        const metadata = response.data.metadata;
        setUrlContent({
          content,
          charCount: content.length,
          pagesCrawled: metadata?.pagesCrawled || 1,
        });
        onContentExtracted(content);
        toast.success(`Successfully crawled ${metadata?.pagesCrawled || 1} page(s) with ${content.length.toLocaleString()} characters`);
      } else {
        toast.error('Crawling failed: ' + (response.data.error || 'Unknown error'));
      }
    } catch (err: any) {
      console.error('URL fetch error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch URL';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Add Your Content</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Upload documents or crawl websites to extract content for AI-powered FAQ generation
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setMode('file')}
            className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === 'file'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upload Files
          </button>
          <button
            onClick={() => setMode('url')}
            className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === 'url'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Crawl Website
          </button>
        </div>
      </div>

      {/* File Upload Mode */}
      {mode === 'file' && (
        <div className="card p-8">
          <div className="space-y-6">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-slate-400 transition-colors bg-slate-50/50">
              <input
                type="file"
                id="file-upload"
                multiple
                accept=".pdf,.docx,.txt,.md,.markdown"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="mx-auto w-16 h-16 mb-6 text-slate-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload Documents</h3>
                <p className="text-slate-600 mb-4">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-sm text-slate-500">
                  Supports PDF, DOCX, TXT, and Markdown files
                </p>
              </label>
            </div>

            {files.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900">Selected Files</h4>
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{file.name}</p>
                        <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {parsedFiles.length > 0 && (
              <div className="card bg-green-50 border-green-200 p-6">
                <h3 className="text-sm font-semibold text-green-900 mb-3">Content Extracted</h3>
                <div className="space-y-2">
                  {parsedFiles.map((file, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-green-800">{file.name}</span>
                      <span className="text-green-600">{file.wordCount.toLocaleString()} words</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-green-200 flex justify-between font-semibold">
                    <span className="text-green-900">Total</span>
                    <span className="text-green-700">
                      {parsedFiles.reduce((sum, f) => sum + f.wordCount, 0).toLocaleString()} words
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleUploadFiles}
              disabled={loading || files.length === 0}
              className="btn-primary w-full"
            >
              {loading ? 'Processing...' : `Process ${files.length} File${files.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}

      {/* URL Crawl Mode */}
      {mode === 'url' && (
        <div className="card p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Website URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/documentation"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Crawl Depth
              </label>
              <div className="grid grid-cols-3 gap-4">
                <label className="flex items-center p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="depth"
                    value="1"
                    checked={crawlDepth === 1}
                    onChange={(e) => setCrawlDepth(parseInt(e.target.value))}
                    className="text-slate-600 focus:ring-slate-500 mr-3"
                  />
                  <div>
                    <div className="font-medium text-slate-900">Single Page</div>
                    <div className="text-sm text-slate-500">Fast, single page only</div>
                  </div>
                </label>
                <label className="flex items-center p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="depth"
                    value="2"
                    checked={crawlDepth === 2}
                    onChange={(e) => setCrawlDepth(parseInt(e.target.value))}
                    className="text-slate-600 focus:ring-slate-500 mr-3"
                  />
                  <div>
                    <div className="font-medium text-slate-900">+1 Level</div>
                    <div className="text-sm text-slate-500">Main page + linked pages</div>
                  </div>
                </label>
                <label className="flex items-center p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="depth"
                    value="3"
                    checked={crawlDepth === 3}
                    onChange={(e) => setCrawlDepth(parseInt(e.target.value))}
                    className="text-slate-600 focus:ring-slate-500 mr-3"
                  />
                  <div>
                    <div className="font-medium text-slate-900">+2 Levels</div>
                    <div className="text-sm text-slate-500">Comprehensive crawling</div>
                  </div>
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Higher depth crawls more pages but takes longer. Only crawls same domain.
              </p>
            </div>

            {urlContent && (
              <div className="card bg-blue-50 border-blue-200 p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-blue-900">Content Extracted</span>
                  <div className="text-sm text-blue-600">
                    {urlContent.pagesCrawled && urlContent.pagesCrawled > 1 ? (
                      <span>{urlContent.pagesCrawled} pages • {urlContent.charCount.toLocaleString()} chars</span>
                    ) : (
                      <span>{urlContent.charCount.toLocaleString()} characters</span>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg border border-blue-100 max-h-32 overflow-y-auto">
                  <p className="text-xs text-slate-600 line-clamp-4">{urlContent.content.substring(0, 200)}...</p>
                </div>
              </div>
            )}

            <button
              onClick={handleFetchURL}
              disabled={loading || !url.trim()}
              className="btn-primary w-full"
            >
              {loading ? 'Crawling...' : `Crawl Website (Depth ${crawlDepth})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};