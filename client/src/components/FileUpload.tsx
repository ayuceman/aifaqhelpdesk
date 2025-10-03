import React, { useState } from 'react';
import axios from 'axios';

interface FileUploadProps {
  onContentExtracted: (content: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onContentExtracted }) => {
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedContent, setExtractedContent] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (uploadType === 'file' && !file) {
      setError('Please select a file');
      return;
    }
    
    if (uploadType === 'url' && !url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let response;
      
      if (uploadType === 'file') {
        const formData = new FormData();
        formData.append('file', file!);
        
        response = await axios.post('http://localhost:3001/api/upload/file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await axios.post('http://localhost:3001/api/upload/url', { url });
      }

      if (response.data.success) {
        setExtractedContent(response.data.content);
        onContentExtracted(response.data.content);
      } else {
        setError('Failed to extract content');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Upload Content</h2>
        
        {/* Upload Type Selection */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="file"
                checked={uploadType === 'file'}
                onChange={(e) => setUploadType(e.target.value as 'file' | 'url')}
                className="mr-2"
              />
              Upload File
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="url"
                checked={uploadType === 'url'}
                onChange={(e) => setUploadType(e.target.value as 'file' | 'url')}
                className="mr-2"
              />
              Crawl Website
            </label>
          </div>
        </div>

        {/* File Upload */}
        {uploadType === 'file' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File (PDF, DOCX, TXT, Markdown)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,.txt,.md,.markdown"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        )}

        {/* URL Input */}
        {uploadType === 'url' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Extract Content'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Extracted Content Preview */}
        {extractedContent && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Extracted Content</h3>
            <div className="bg-gray-50 p-4 rounded-md max-h-64 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {extractedContent.substring(0, 1000)}
                {extractedContent.length > 1000 && '...'}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Character count: {extractedContent.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
