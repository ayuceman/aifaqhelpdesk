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
      toast.info(`Crawling website with depth ${crawlDepth}...`);
      const response = await axios.post('http://localhost:3001/api/upload/url', { 
        url, 
        depth: crawlDepth 
      });
      
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
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Content Sources</h2>
        <p className="text-sm text-gray-600">Upload files or crawl a website to generate FAQs</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg inline-flex">
        <button
          onClick={() => setMode('file')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
            mode === 'file'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Upload Files
        </button>
        <button
          onClick={() => setMode('url')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
            mode === 'url'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Crawl Website
        </button>
      </div>

      {/* File Upload Mode */}
      {mode === 'file' && (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              id="file-upload"
              multiple
              accept=".pdf,.docx,.txt,.md,.markdown"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="mx-auto w-12 h-12 mb-4 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PDF, DOCX, TXT, or Markdown (max 10MB each)
              </p>
            </label>
          </div>

          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Selected Files ({files.length})</h3>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {parsedFiles.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-900 mb-3">Parsed Content</h3>
              <div className="space-y-2">
                {parsedFiles.map((file, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-green-800">{file.name}</span>
                    <span className="text-green-600">{file.wordCount.toLocaleString()} words</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-green-200 flex justify-between font-medium">
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
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? 'Processing...' : `Parse ${files.length} File${files.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {/* URL Crawl Mode */}
      {mode === 'url' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/documentation"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crawl Depth
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="depth1"
                  name="depth"
                  value="1"
                  checked={crawlDepth === 1}
                  onChange={(e) => setCrawlDepth(parseInt(e.target.value))}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="depth1" className="text-sm text-gray-700">
                  Single page (1)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="depth2"
                  name="depth"
                  value="2"
                  checked={crawlDepth === 2}
                  onChange={(e) => setCrawlDepth(parseInt(e.target.value))}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="depth2" className="text-sm text-gray-700">
                  +1 level (2)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="depth3"
                  name="depth"
                  value="3"
                  checked={crawlDepth === 3}
                  onChange={(e) => setCrawlDepth(parseInt(e.target.value))}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="depth3" className="text-sm text-gray-700">
                  +2 levels (3)
                </label>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Higher depth crawls more pages but takes longer. Only crawls same domain.
            </p>
          </div>

          {urlContent && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-900">Content Fetched</span>
                <div className="text-sm text-blue-600">
                  {urlContent.pagesCrawled && urlContent.pagesCrawled > 1 ? (
                    <span>{urlContent.pagesCrawled} pages • {urlContent.charCount.toLocaleString()} chars</span>
                  ) : (
                    <span>{urlContent.charCount.toLocaleString()} characters</span>
                  )}
                </div>
              </div>
              <div className="mt-3 p-3 bg-white rounded border border-blue-100 max-h-32 overflow-y-auto">
                <p className="text-xs text-gray-600 line-clamp-4">{urlContent.content.substring(0, 200)}...</p>
              </div>
            </div>
          )}

          <button
            onClick={handleFetchURL}
            disabled={loading || !url.trim()}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? 'Crawling...' : `Crawl Website (Depth ${crawlDepth})`}
          </button>
        </div>
      )}
    </div>
  );
};
