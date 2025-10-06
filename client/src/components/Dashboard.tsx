import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from './DashboardLayout';
import {
  PlusIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  EyeIcon,
  SparklesIcon,
  RocketLaunchIcon,
  FolderIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

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

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  trialStartDate?: string;
  trialEndDate?: string;
  trialPlanId?: string;
  subscriptionStatus?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  interval?: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onNavigateToProject: (projectId: string) => void;
  onViewProjectDetails: (project: Project) => void;
  onNavigateToHome: () => void;
  onNavigateToUpgrade?: () => void;
  onNavigateToSubscriptionManagement?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  onLogout, 
  onNavigateToProject, 
  onViewProjectDetails,
  onNavigateToHome,
  onNavigateToUpgrade,
  onNavigateToSubscriptionManagement
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    slug: '',
    description: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setProjects(response.data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3001/api/projects', newProject, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setProjects([response.data.project, ...projects]);
        setNewProject({ name: '', slug: '', description: '' });
        setShowCreateProject(false);
      }
    } catch (error: any) {
      console.error('Error creating project:', error);
      alert(error.response?.data?.error || 'Failed to create project');
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
    setNewProject({
      ...newProject,
      name,
      slug: generateSlug(name)
    });
  };

  const getPlanDisplayName = (plan: string) => {
    const planNames: { [key: string]: string } = {
      free: 'Free Plan',
      trial: 'Trial',
      starter: 'Starter',
      professional: 'Professional',
      enterprise: 'Enterprise'
    };
    return planNames[plan] || plan;
  };

  const getPlanColor = (plan: string) => {
    const colors: { [key: string]: string } = {
      free: 'from-slate-500 to-slate-600',
      trial: 'from-blue-500 to-blue-600',
      starter: 'from-green-500 to-green-600',
      professional: 'from-purple-500 to-purple-600',
      enterprise: 'from-yellow-500 to-yellow-600'
    };
    return colors[plan] || 'from-slate-500 to-slate-600';
  };

  // Calculate totals
  const totalFAQs = projects.reduce((sum, p) => sum + p.faq_count, 0);
  const totalChats = projects.reduce((sum, p) => sum + p.chat_count, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Welcome back, {user.name.split(' ')[0]}! 👋</h2>
                <p className="text-slate-600 mt-1">Here's what's happening with your projects today.</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${getPlanColor(user.plan)} text-white font-semibold shadow-lg`}>
                  <div className="flex items-center space-x-2">
                    <SparklesIcon className="w-5 h-5" />
                    <span>{getPlanDisplayName(user.plan)}</span>
                  </div>
                </div>
                {onNavigateToUpgrade && (user.plan === 'free' || user.plan === 'trial') && (
                  <button
                    onClick={onNavigateToUpgrade}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
                  >
                    <div className="flex items-center space-x-2">
                      <RocketLaunchIcon className="w-5 h-5" />
                      <span>Upgrade Plan</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FolderIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">📁</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">{projects.length}</h3>
            <p className="text-slate-600 text-sm">Total Projects</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">{totalFAQs}</h3>
            <p className="text-slate-600 text-sm">Total FAQs</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">{totalChats}</h3>
            <p className="text-slate-600 text-sm">Total Chats</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">
              {projects.length > 0 ? Math.round(totalChats / projects.length) : 0}
            </h3>
            <p className="text-slate-600 text-sm">Avg. Chats/Project</p>
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Your Projects</h3>
                <p className="text-slate-600 text-sm mt-1">Manage and monitor your FAQ projects</p>
              </div>
              <button
                onClick={() => setShowCreateProject(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>New Project</span>
              </button>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="p-6">
            {projects.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FolderIcon className="w-10 h-10 text-blue-600" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">No projects yet</h4>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  Get started by creating your first FAQ project and start helping your customers instantly
                </p>
                <button
                  onClick={() => setShowCreateProject(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105 inline-flex items-center space-x-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Create Your First Project</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div 
                    key={project.id} 
                    className="group bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 p-6 hover:border-blue-300 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {project.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded inline-block">
                          {project.slug}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <FolderIcon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    
                    {project.description && (
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white rounded-lg p-3 border border-slate-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <DocumentTextIcon className="w-4 h-4 text-green-600" />
                          <span className="text-xs text-slate-600">FAQs</span>
                        </div>
                        <p className="text-xl font-bold text-slate-900">{project.faq_count}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-slate-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <ChatBubbleLeftRightIcon className="w-4 h-4 text-purple-600" />
                          <span className="text-xs text-slate-600">Chats</span>
                        </div>
                        <p className="text-xl font-bold text-slate-900">{project.chat_count}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onNavigateToProject(project.id)}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all text-sm"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => onViewProjectDetails(project)}
                        className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border-2 border-slate-200 hover:border-slate-300 transition-all"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={newProject.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                  placeholder="My Awesome Project"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  required
                  value={newProject.slug}
                  onChange={(e) => setNewProject({ ...newProject, slug: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-mono text-sm"
                  placeholder="my-awesome-project"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none"
                  rows={3}
                  placeholder="What is this project about?"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateProject(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
