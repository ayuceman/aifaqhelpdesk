import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  created_at: string;
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

  useEffect(() => {
    fetchProjectDetails();
    fetchFAQs();
    fetchCategories();
    fetchAnalytics();
  }, [projectId]);

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

        {/* Enterprise Controls */}
        <div className="card p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="input-field"
              />
            </div>
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="input-field min-w-32"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.category} value={cat.category}>
                  {cat.category} ({cat.count})
                </option>
              ))}
            </select>
            
            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                handleSort(field, order);
              }}
              className="input-field min-w-32"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="question-asc">Question A-Z</option>
              <option value="question-desc">Question Z-A</option>
              <option value="view_count-desc">Most Popular</option>
            </select>
            
            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="btn-secondary"
              >
                Analytics
              </button>
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="btn-secondary"
              >
                Bulk Actions
              </button>
              <div className="relative">
                <button className="btn-secondary">
                  Export ▼
                </button>
                <div className="absolute right-0 mt-1 bg-white border rounded shadow-lg hidden">
                  <button
                    onClick={() => handleExport('json')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Export CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bulk Actions */}
          {showBulkActions && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">
                  {selectedFAQs.length} selected
                </span>
                {selectedFAQs.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="btn-secondary bg-red-600 hover:bg-red-700"
                  >
                    Delete Selected
                  </button>
                )}
                <button
                  onClick={() => setSelectedFAQs(faqs.map(f => f.id))}
                  className="btn-secondary"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedFAQs([])}
                  className="btn-secondary"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Analytics Panel */}
        {showAnalytics && analytics && (
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Analytics (Last 30 Days)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analytics.stats.total_faqs}</div>
                <div className="text-sm text-slate-600">Total FAQs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analytics.stats.faqs_this_week}</div>
                <div className="text-sm text-slate-600">This Week</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{analytics.stats.faqs_this_month}</div>
                <div className="text-sm text-slate-600">This Month</div>
              </div>
            </div>
            {analytics.categories.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-slate-900 mb-2">Category Distribution</h4>
                <div className="space-y-2">
                  {analytics.categories.map((cat: any) => (
                    <div key={cat.category} className="flex justify-between items-center">
                      <span className="text-sm">{cat.category}</span>
                      <span className="text-sm font-medium">{cat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FAQs Section */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              FAQs ({totalFAQs})
              {searchQuery && <span className="text-sm text-slate-500 ml-2">(filtered)</span>}
            </h2>
            <button
              onClick={() => window.open(`http://localhost:3001/widget?project=${project.slug}`, '_blank')}
              className="btn-secondary"
            >
              Test Widget
            </button>
          </div>

          {faqs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No FAQs yet</h3>
              <p className="text-slate-600 mb-4">Generate your first FAQs to get started</p>
            </div>
          ) : (
            <div>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      {showBulkActions && (
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
                          className="mt-1"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-slate-900">{faq.question}</h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditFAQ(faq)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteFAQ(faq.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm">{faq.answer}</p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-slate-400">
                            Created {new Date(faq.created_at).toLocaleDateString()}
                          </p>
                          {faq.category && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {faq.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
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
    </div>
  );
};

export default ProjectDetails;
