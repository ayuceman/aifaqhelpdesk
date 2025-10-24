import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ContentManager from './ContentManager';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  created_at: string;
  category?: string;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  faq_count: number;
  chat_count: number;
  daily_chat_count: number;
  last_chat_date?: string;
  created_at: string;
  updated_at: string;
}

interface ProjectDetailsProps {
  projectId: string;
  onBack: () => void;
  onEditProject: (project: Project) => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ 
  projectId, 
  onBack, 
  onEditProject 
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    description: ''
  });
  
  // Enterprise features state
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFAQs, setTotalFAQs] = useState(0);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedFAQs, setSelectedFAQs] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('');
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditCategory, setBulkEditCategory] = useState('');
  const [bulkEditPrefix, setBulkEditPrefix] = useState('');
  const [bulkEditSuffix, setBulkEditSuffix] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [gridEditingFAQ, setGridEditingFAQ] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<{question: string, answer: string, category: string}>({question: '', answer: '', category: ''});
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'faqs' | 'content'>('faqs');

  useEffect(() => {
    fetchProjectDetails();
    fetchFAQs();
    fetchCategories();
    fetchAnalytics();
  }, [projectId]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportDropdown) {
        const target = event.target as Element;
        if (!target.closest('.export-dropdown')) {
          setShowExportDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportDropdown]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/api/faq/${projectId}/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/api/faq/${projectId}/analytics?period=30d`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchProjectDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setProject(response.data.project);
        setEditForm({
          name: response.data.project.name,
          slug: response.data.project.slug,
          description: response.data.project.description || ''
        });
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
    }
  };

  const fetchFAQs = async (page = currentPage, search = searchQuery, category = selectedCategory, sort = sortBy, order = sortOrder) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy: sort,
        sortOrder: order
      });
      
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      
      const response = await axios.get(`http://localhost:3001/api/faq/${projectId}?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setFaqs(response.data.faqs);
        setTotalPages(response.data.pagination.totalPages);
        setTotalFAQs(response.data.pagination.total);
        setCurrentPage(response.data.pagination.page);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:3001/api/projects/${projectId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setProject(response.data.project);
        setShowEditModal(false);
        onEditProject(response.data.project);
      }
    } catch (error: any) {
      console.error('Error updating project:', error);
      alert(error.response?.data?.error || 'Failed to update project');
    }
  };

  const handleDeleteFAQ = async (faqId: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:3001/api/faq/${faqId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setFaqs(faqs.filter(faq => faq.id !== faqId));
        if (project) {
          setProject({ ...project, faq_count: project.faq_count - 1 });
        }
      }
    } catch (error: any) {
      console.error('Error deleting FAQ:', error);
      alert(error.response?.data?.error || 'Failed to delete FAQ');
    }
  };

  const handleEditFAQ = async (faq: FAQ) => {
    setEditingFAQ(faq);
  };

  const handleSaveFAQ = async (updatedFAQ: FAQ) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:3001/api/faq/${updatedFAQ.id}`, {
        question: updatedFAQ.question,
        answer: updatedFAQ.answer
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setFaqs(faqs.map(faq => faq.id === updatedFAQ.id ? updatedFAQ : faq));
        setEditingFAQ(null);
      }
    } catch (error: any) {
      console.error('Error updating FAQ:', error);
      alert(error.response?.data?.error || 'Failed to update FAQ');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    fetchFAQs(1, query, selectedCategory, sortBy, sortOrder);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    fetchFAQs(1, searchQuery, category, sortBy, sortOrder);
  };

  const handleSort = (field: string, order: string) => {
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
    fetchFAQs(1, searchQuery, selectedCategory, field, order);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchFAQs(page, searchQuery, selectedCategory, sortBy, sortOrder);
  };

  const handleBulkDelete = async () => {
    if (selectedFAQs.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedFAQs.length} FAQs?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:3001/api/faq/${projectId}/bulk-operations`, {
        operation: 'delete',
        faqIds: selectedFAQs,
        data: {}
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSelectedFAQs([]);
        fetchFAQs();
        alert(`Successfully deleted ${response.data.processed} FAQs`);
      }
    } catch (error: any) {
      console.error('Error bulk deleting FAQs:', error);
      alert(error.response?.data?.error || 'Failed to delete FAQs');
    }
  };

  const handleBulkCategoryUpdate = async () => {
    if (selectedFAQs.length === 0 || !bulkCategory) return;
    
    if (!confirm(`Are you sure you want to update the category for ${selectedFAQs.length} FAQs to "${bulkCategory}"?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:3001/api/faq/${projectId}/bulk-operations`, {
        operation: 'update',
        faqIds: selectedFAQs,
        data: { category: bulkCategory }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSelectedFAQs([]);
        setBulkCategory('');
        fetchFAQs();
        fetchCategories();
        alert(`Successfully updated category for ${response.data.processed} FAQs`);
      }
    } catch (error: any) {
      console.error('Error bulk updating FAQ categories:', error);
      alert(error.response?.data?.error || 'Failed to update FAQ categories');
    }
  };

  const handleBulkEditApply = async () => {
    if (selectedFAQs.length === 0) return;
    
    const changes = [];
    if (bulkEditCategory) changes.push(`category to "${bulkEditCategory}"`);
    if (bulkEditPrefix) changes.push(`add prefix "${bulkEditPrefix}" to questions`);
    if (bulkEditSuffix) changes.push(`add suffix "${bulkEditSuffix}" to answers`);
    
    if (changes.length === 0) {
      alert('Please select at least one change to apply');
      return;
    }
    
    if (!confirm(`Are you sure you want to apply these changes to ${selectedFAQs.length} FAQs?\n\n${changes.join('\n')}`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:3001/api/faq/${projectId}/bulk-operations`, {
        operation: 'bulk-edit',
        faqIds: selectedFAQs,
        data: {
          category: bulkEditCategory || undefined,
          questionPrefix: bulkEditPrefix || undefined,
          answerSuffix: bulkEditSuffix || undefined
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSelectedFAQs([]);
        setBulkEditCategory('');
        setBulkEditPrefix('');
        setBulkEditSuffix('');
        setShowBulkEditModal(false);
        fetchFAQs();
        fetchCategories();
        alert(`Successfully applied changes to ${response.data.processed} FAQs`);
      }
    } catch (error: any) {
      console.error('Error bulk editing FAQs:', error);
      alert(error.response?.data?.error || 'Failed to apply bulk edits');
    }
  };

  const handleStartEdit = (faq: any) => {
    setGridEditingFAQ(faq.id);
    setEditingData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || ''
    });
  };

  const handleCancelEdit = () => {
    setGridEditingFAQ(null);
    setEditingData({question: '', answer: '', category: ''});
  };

  const handleSaveEdit = async (faqId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:3001/api/faq/${faqId}`, {
        question: editingData.question,
        answer: editingData.answer,
        category: editingData.category
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setGridEditingFAQ(null);
        setEditingData({question: '', answer: '', category: ''});
        fetchFAQs();
        fetchCategories();
      }
    } catch (error: any) {
      console.error('Error updating FAQ:', error);
      alert(error.response?.data?.error || 'Failed to update FAQ');
    }
  };

  const handleExport = async (format: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/api/faq/${projectId}/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `faqs-${project?.slug}-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Error exporting FAQs:', error);
      alert(error.response?.data?.error || 'Failed to export FAQs');
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 50);
  };

  const handleNameChange = (name: string) => {
    setEditForm({
      ...editForm,
      name,
      slug: generateSlug(name)
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Project not found</h2>
          <button onClick={onBack} className="btn-primary">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button onClick={onBack} className="text-slate-600 hover:text-slate-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
                <p className="text-sm text-slate-600">{project.slug}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="btn-secondary"
              >
                Edit Project
              </button>
              <button
                onClick={() => window.open(`http://localhost:3001/widget?project=${project.slug}`, '_blank')}
                className="btn-primary"
              >
                View Widget
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-600">Total FAQs</p>
                <p className="text-2xl font-bold text-slate-900">{project.faq_count}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-600">Total Chats</p>
                <p className="text-2xl font-bold text-slate-900">{project.chat_count}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-600">Daily Chats</p>
                <p className="text-2xl font-bold text-slate-900">{project.daily_chat_count}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('faqs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'faqs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>FAQs ({totalFAQs})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'content'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Content Sources</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Content Management Tab */}
        {activeTab === 'content' && (
          <div className="mb-6">
            <ContentManager
              projectId={projectId}
              onContentAdded={(content) => {
                console.log('Content added:', content);
              }}
              onFAQsGenerated={(faqs) => {
                console.log('FAQs generated:', faqs);
                fetchFAQs();
                if (project) {
                  setProject({ ...project, faq_count: project.faq_count + faqs.length });
                }
              }}
              toast={{
                success: (message) => alert(`Success: ${message}`),
                error: (message) => alert(`Error: ${message}`),
                info: (message) => console.log(`Info: ${message}`)
              }}
            />
          </div>
        )}

        {/* FAQ Management Tab */}
        {activeTab === 'faqs' && (
          <>
            {/* Professional Admin Header */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm mb-6">
              {/* Header Section */}
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">FAQ Management</h2>
                    <p className="text-sm text-slate-600 mt-1">
                      Manage and organize your knowledge base ({totalFAQs} total FAQs)
                    </p>
                  </div>
              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      viewMode === 'table'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0V4a2 2 0 012-2h14a2 2 0 012 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Grid
                  </button>
                </div>

                <button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Analytics
                </button>
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Bulk Actions
                </button>
                <div className="relative export-dropdown">
                  <button 
                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export
                    <svg className={`w-4 h-4 ml-1 transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showExportDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-md shadow-lg z-10">
                      <button
                        onClick={() => {
                          handleExport('json');
                          setShowExportDropdown(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Export as JSON
                      </button>
                      <button
                        onClick={() => {
                          handleExport('csv');
                          setShowExportDropdown(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export as CSV
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="px-6 py-4">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="flex-1 min-w-80">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search FAQs by question or answer..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              {/* Category Filter */}
              <div className="min-w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {cat.category} ({cat.count})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Sort */}
              <div className="min-w-48">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    handleSort(field, order);
                  }}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="created_at-desc">Newest First</option>
                  <option value="created_at-asc">Oldest First</option>
                  <option value="question-asc">Question A-Z</option>
                  <option value="question-desc">Question Z-A</option>
                  <option value="view_count-desc">Most Popular</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Bulk Actions */}
          {showBulkActions && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-700">
                    {selectedFAQs.length} of {faqs.length} FAQs selected
                  </span>
                  {selectedFAQs.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleBulkDelete}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Selected
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <select
                          value={bulkCategory}
                          onChange={(e) => setBulkCategory(e.target.value)}
                          className="text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Set Category</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <button
                          onClick={handleBulkCategoryUpdate}
                          disabled={!bulkCategory}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          Update Category
                        </button>
                        
                        <button
                          onClick={() => setShowBulkEditModal(true)}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Advanced Edit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedFAQs(faqs.map(f => f.id))}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setSelectedFAQs([])}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Professional Analytics Dashboard */}
        {showAnalytics && analytics && (
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm mb-6">
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Knowledge Base Analytics</h3>
                <span className="text-sm text-slate-500">Last 30 days</span>
              </div>
            </div>
            
            <div className="p-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Total FAQs</p>
                      <p className="text-2xl font-bold text-blue-900">{analytics.stats.total_faqs}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">This Week</p>
                      <p className="text-2xl font-bold text-green-900">{analytics.stats.faqs_this_week}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">This Month</p>
                      <p className="text-2xl font-bold text-purple-900">{analytics.stats.faqs_this_month}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-orange-600">Categories</p>
                      <p className="text-2xl font-bold text-orange-900">{analytics.categories.length}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Category Distribution */}
              {analytics.categories.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-slate-900 mb-4">Category Distribution</h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="space-y-3">
                      {analytics.categories.map((cat: any, index: number) => (
                        <div key={cat.category} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${
                              index === 0 ? 'bg-blue-500' :
                              index === 1 ? 'bg-green-500' :
                              index === 2 ? 'bg-purple-500' :
                              index === 3 ? 'bg-orange-500' :
                              'bg-slate-400'
                            }`}></div>
                            <span className="text-sm font-medium text-slate-700">{cat.category}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-slate-600 mr-2">{cat.count} FAQs</span>
                            <div className="w-16 bg-slate-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  index === 0 ? 'bg-blue-500' :
                                  index === 1 ? 'bg-green-500' :
                                  index === 2 ? 'bg-purple-500' :
                                  index === 3 ? 'bg-orange-500' :
                                  'bg-slate-400'
                                }`}
                                style={{ width: `${(cat.count / analytics.stats.total_faqs) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Professional FAQ Table */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
          {/* Table Header */}
          <div className="px-6 py-3 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">
                Knowledge Base
                {searchQuery && <span className="text-sm text-slate-500 ml-2">(filtered results)</span>}
              </h3>
              <button
                onClick={() => window.open(`http://localhost:3001/widget?project=${project.slug}`, '_blank')}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Test Widget
              </button>
            </div>
          </div>

          {faqs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No FAQs found</h3>
              <p className="text-slate-600 mb-4">
                {searchQuery ? 'Try adjusting your search criteria' : 'Generate your first FAQs to get started'}
              </p>
            </div>
          ) : (
            <div>
              {viewMode === 'table' ? (
                /* Table View */
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      {showBulkActions && (
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedFAQs.length === faqs.length && faqs.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFAQs(faqs.map(f => f.id));
                              } else {
                                setSelectedFAQs([]);
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          />
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Question
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Answer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {faqs.map((faq) => (
                      <tr key={faq.id} className="hover:bg-slate-50">
                        {showBulkActions && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedFAQs.includes(faq.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedFAQs([...selectedFAQs, faq.id]);
                                } else {
                                  setSelectedFAQs(selectedFAQs.filter(id => id !== faq.id));
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                            />
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900 max-w-xs truncate">
                            {faq.question}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-600 max-w-xs truncate">
                            {faq.answer}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {faq.category ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {faq.category}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">No category</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(faq.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditFAQ(faq)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteFAQ(faq.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
              ) : (
                /* Grid View */
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      {gridEditingFAQ === faq.id ? (
                        /* Edit Mode */
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Question
                            </label>
                            <textarea
                              value={editingData.question}
                              onChange={(e) => setEditingData({...editingData, question: e.target.value})}
                              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Answer
                            </label>
                            <textarea
                              value={editingData.answer}
                              onChange={(e) => setEditingData({...editingData, answer: e.target.value})}
                              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              rows={3}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Category
                            </label>
                            <select
                              value={editingData.category}
                              onChange={(e) => setEditingData({...editingData, category: e.target.value})}
                              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              <option value="">No category</option>
                              {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 text-sm text-slate-600 hover:text-slate-800"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEdit(faq.id)}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-sm font-medium text-slate-900 line-clamp-2">
                              {faq.question}
                            </h3>
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={() => handleStartEdit(faq)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteFAQ(faq.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-3 mb-3">
                            {faq.answer}
                          </p>
                          <div className="flex items-center justify-between">
                            {faq.category ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {faq.category}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">No category</span>
                            )}
                            <span className="text-xs text-slate-500">
                              {new Date(faq.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Professional Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-700">
                        Showing{' '}
                        <span className="font-medium">{(currentPage - 1) * 20 + 1}</span>
                        {' '}to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * 20, totalFAQs)}
                        </span>
                        {' '}of{' '}
                        <span className="font-medium">{totalFAQs}</span>
                        {' '}results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === page
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
          </>
        )}
      </main>

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Edit Project</h3>
            
            <form onSubmit={handleUpdateProject}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Project Slug
                  </label>
                  <input
                    type="text"
                    value={editForm.slug}
                    onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="input-field"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit FAQ Modal */}
      {editingFAQ && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Edit FAQ</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={editingFAQ.question}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Answer
                </label>
                <textarea
                  value={editingFAQ.answer}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })}
                  className="input-field"
                  rows={4}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingFAQ(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveFAQ(editingFAQ)}
                className="btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      {showBulkEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Bulk Edit FAQs</h3>
              <button
                onClick={() => setShowBulkEditModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{selectedFAQs.length} FAQs</strong> selected for bulk editing
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Update Category
                </label>
                <select
                  value={bulkEditCategory}
                  onChange={(e) => setBulkEditCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Keep current categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Add Prefix to Questions
                </label>
                <input
                  type="text"
                  value={bulkEditPrefix}
                  onChange={(e) => setBulkEditPrefix(e.target.value)}
                  placeholder="e.g., 'FAQ: ' or 'Q: '"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Add Suffix to Answers
                </label>
                <input
                  type="text"
                  value={bulkEditSuffix}
                  onChange={(e) => setBulkEditSuffix(e.target.value)}
                  placeholder="e.g., ' - Contact support for more help'"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowBulkEditModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkEditApply}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
