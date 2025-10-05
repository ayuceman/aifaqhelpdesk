import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
  createdAt: string;
  updatedAt: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onNavigateToProject: (projectId: string) => void;
  onViewProjectDetails: (project: Project) => void;
  onNavigateToHome: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  onLogout, 
  onNavigateToProject, 
  onViewProjectDetails,
  onNavigateToHome 
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
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
      free: 'Free',
      trial: 'Trial',
      starter: 'Starter',
      professional: 'Professional',
      enterprise: 'Enterprise'
    };
    return planNames[plan] || plan;
  };

  const getPlanColor = (plan: string) => {
    const colors: { [key: string]: string } = {
      free: 'bg-slate-100 text-slate-800',
      trial: 'bg-blue-100 text-blue-800',
      starter: 'bg-green-100 text-green-800',
      professional: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-yellow-100 text-yellow-800'
    };
    return colors[plan] || 'bg-slate-100 text-slate-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">AI FAQ Generator</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600">Welcome, {user.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(user.plan)}`}>
                  {getPlanDisplayName(user.plan)}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Your Projects</h2>
            <button
              onClick={() => setShowCreateProject(true)}
              className="btn-primary"
            >
              Create New Project
            </button>
          </div>
          
          <p className="text-slate-600">
            Manage your FAQ projects and chatbot assistants
          </p>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No projects yet</h3>
            <p className="text-slate-600 mb-4">Create your first project to get started</p>
            <button
              onClick={() => setShowCreateProject(true)}
              className="btn-primary"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">{project.name}</h3>
                  <span className="text-xs text-slate-500">{project.slug}</span>
                </div>
                
                {project.description && (
                  <p className="text-slate-600 text-sm mb-4">{project.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-slate-500">FAQs:</span>
                    <span className="ml-1 font-medium">{project.faq_count}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Chats:</span>
                    <span className="ml-1 font-medium">{project.chat_count}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => onNavigateToProject(project.id)}
                    className="btn-primary flex-1"
                  >
                    Open Project
                  </button>
                  <button
                    onClick={() => onViewProjectDetails(project)}
                    className="btn-secondary flex-1"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Project Modal */}
        {showCreateProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Project</h3>
              
              <form onSubmit={handleCreateProject}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={newProject.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="input-field"
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Project Slug
                    </label>
                    <input
                      type="text"
                      value={newProject.slug}
                      onChange={(e) => setNewProject({ ...newProject, slug: e.target.value })}
                      className="input-field"
                      placeholder="project-slug"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Used in URLs and embed codes
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      className="input-field"
                      rows={3}
                      placeholder="Describe your project"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateProject(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
