import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  DocumentTextIcon,
  LinkIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ContentSource {
  id: string;
  type: 'file' | 'url';
  name: string;
  content: string;
  created_at: string;
  file_size?: number;
  url?: string;
}

interface ContentManagerProps {
  projectId: string;
  onContentAdded: (content: string) => void;
  onFAQsGenerated: (faqs: any[]) => void;
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
}

const ContentManager: React.FC<ContentManagerProps> = ({
  projectId,
  onContentAdded,
  onFAQsGenerated,
  toast
}) => {
  const [sources, setSources] = useState<ContentSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [crawlDepth, setCrawlDepth] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [tone, setTone] = useState<'formal' | 'concise' | 'friendly'>('friendly');
  const [maxQuestions, setMaxQuestions] = useState(15);

  useEffect(() => {
    fetchSources();
  }, [projectId]);

  const fetchSources = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/api/projects/${projectId}/sources`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSources(response.data.sources);
      }
    } catch (error) {
      console.error('Error fetching sources:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:3001/api/projects/${projectId}/sources/file`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('File uploaded successfully!');
        setSelectedFile(null);
        setShowAddModal(false);
        fetchSources();
        onContentAdded(response.data.content);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlCrawl = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:3001/api/projects/${projectId}/sources/url`, {
        url: url.trim(),
        depth: crawlDepth
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success(`Successfully crawled ${response.data.metadata?.pagesCrawled || 1} page(s)`);
        setUrl('');
        setShowAddModal(false);
        fetchSources();
        onContentAdded(response.data.content);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to crawl URL');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    if (!confirm('Are you sure you want to delete this content source?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:3001/api/projects/${projectId}/sources/${sourceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Content source deleted');
        fetchSources();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete source');
    }
  };

  const handleGenerateFAQs = async () => {
    if (sources.length === 0) {
      toast.error('No content sources available');
      return;
    }

    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:3001/api/projects/${projectId}/generate-faqs`, {
        tone,
        maxQuestions
      }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 300000 // 5 minutes timeout for FAQ generation
      });

      if (response.data.success) {
        const { faqs, count, created } = response.data;
        if (created === count) {
          toast.success(`Successfully generated and saved ${created} FAQs!`);
        } else if (created > 0) {
          toast.success(`Generated ${count} FAQs, successfully saved ${created} FAQs!`);
        } else {
          toast.error('FAQs were generated but failed to save to database');
        }
        onFAQsGenerated(faqs);
      }
    } catch (error: any) {
      console.error('FAQ generation error:', error);
      if (error.code === 'ECONNABORTED') {
        toast.error('FAQ generation timed out. Please try with fewer questions or shorter content.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to generate FAQs');
      }
    } finally {
      setGenerating(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Content Sources</h3>
          <p className="text-sm text-slate-600">Manage documents and URLs used to generate FAQs</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Content
        </button>
      </div>

      {/* Sources List */}
      {sources.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <DocumentTextIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-slate-900 mb-2">No content sources yet</h4>
          <p className="text-slate-600 mb-4">Add documents or URLs to generate FAQs from your content</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Your First Source
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {sources.map((source) => (
            <div key={source.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {source.type === 'file' ? (
                      <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                    ) : (
                      <LinkIcon className="w-8 h-8 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-900 truncate">{source.name}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-slate-500">
                        {source.type === 'file' ? 'File' : 'URL'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {source.type === 'file' && source.file_size ? formatBytes(source.file_size) : ''}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatDate(source.created_at)}
                      </span>
                    </div>
                    {source.url && (
                      <p className="text-xs text-blue-600 truncate mt-1">{source.url}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.open(`/api/projects/${projectId}/sources/${source.id}/preview`, '_blank')}
                    className="p-1 text-slate-400 hover:text-slate-600"
                    title="Preview content"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSource(source.id)}
                    className="p-1 text-slate-400 hover:text-red-600"
                    title="Delete source"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate FAQs Section */}
      {sources.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-slate-900 mb-2">Generate New FAQs</h4>
            <p className="text-sm text-slate-600 mb-4">
              Generate FAQs from all your content sources ({sources.length} source{sources.length !== 1 ? 's' : ''})
            </p>
            
            {/* FAQ Generation Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as 'formal' | 'concise' | 'friendly')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="friendly">Friendly</option>
                  <option value="formal">Formal</option>
                  <option value="concise">Concise</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Max Questions
                </label>
                <input
                  type="number"
                  value={maxQuestions}
                  onChange={(e) => setMaxQuestions(Math.max(1, Math.min(50, parseInt(e.target.value) || 15)))}
                  min="1"
                  max="50"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={handleGenerateFAQs}
                  disabled={generating}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg shadow-sm transition-colors"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-4 h-4 mr-2" />
                      Generate FAQs
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {generating && (
              <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-sm font-medium text-blue-800">
                    Generating FAQs...
                  </span>
                </div>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>• Processing {sources.length} content source{sources.length !== 1 ? 's' : ''}</div>
                  <div>• Tone: {tone.charAt(0).toUpperCase() + tone.slice(1)}</div>
                  <div>• Max questions: {maxQuestions}</div>
                  <div>• This may take 1-3 minutes depending on content size</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Content Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Add Content Source</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Type Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
              <button
                onClick={() => setUploadType('file')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  uploadType === 'file'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upload File
              </button>
              <button
                onClick={() => setUploadType('url')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  uploadType === 'url'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Crawl URL
              </button>
            </div>

            {/* File Upload */}
            {uploadType === 'file' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select File
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.md"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Supported formats: PDF, DOCX, TXT, Markdown
                  </p>
                </div>
                <button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || loading}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            )}

            {/* URL Crawl */}
            {uploadType === 'url' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Crawl Depth
                  </label>
                  <select
                    value={crawlDepth}
                    onChange={(e) => setCrawlDepth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={1}>1 level (current page only)</option>
                    <option value={2}>2 levels (current page + linked pages)</option>
                    <option value={3}>3 levels (deep crawl)</option>
                  </select>
                </div>
                <button
                  onClick={handleUrlCrawl}
                  disabled={!url.trim() || loading}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? 'Crawling...' : 'Crawl Website'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManager;
