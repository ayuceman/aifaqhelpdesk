import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { PlusIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SettingsPageProps {
  user: any;
  onLogout: () => void;
}

interface AIProviderConfig {
  id?: number;
  providerType: 'openai' | 'gemini' | 'huggingface' | 'ollama';
  apiKey?: string;
  model?: string;
  embeddingModel?: string;
  baseUrl?: string;
  isActive: boolean;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onLogout }) => {
  const [configs, setConfigs] = useState<AIProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConfig, setNewConfig] = useState<Partial<AIProviderConfig>>({
    providerType: 'openai',
    model: 'gpt-3.5-turbo',
    embeddingModel: 'text-embedding-3-small',
    baseUrl: '',
    isActive: false,
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/ai/configs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setConfigs(data.configs || []);
      }
    } catch (error) {
      console.error('Error fetching configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (config: Partial<AIProviderConfig>) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/ai/configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });
      
      if (response.ok) {
        await fetchConfigs();
        setShowAddForm(false);
        setNewConfig({
          providerType: 'openai',
          model: 'gpt-3.5-turbo',
          embeddingModel: 'text-embedding-3-small',
          baseUrl: '',
          isActive: false,
        });
      } else {
        const error = await response.json();
        alert(`Failed to save configuration: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const testConfig = async (config: Partial<AIProviderConfig>) => {
    setTesting(true);
    setTestResult(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/ai/configs/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });
      
      if (response.ok) {
        const result = await response.json();
        setTestResult(result.result);
      } else {
        const error = await response.json();
        setTestResult({ success: false, message: error.error });
      }
    } catch (error) {
      console.error('Error testing config:', error);
      setTestResult({ success: false, message: 'Test failed' });
    } finally {
      setTesting(false);
    }
  };

  const deleteConfig = async (providerType: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/ai/configs/${providerType}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        await fetchConfigs();
      } else {
        const error = await response.json();
        alert(`Failed to delete configuration: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting config:', error);
      alert('Failed to delete configuration');
    }
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'ollama': return '🦙';
      case 'openai': return '🤖';
      case 'huggingface': return '🤗';
      case 'gemini': return '💎';
      default: return '⚙️';
    }
  };

  const getProviderDescription = (type: string) => {
    switch (type) {
      case 'ollama': return 'Local AI models - Free, private, runs on your machine';
      case 'openai': return 'OpenAI GPT models - Powerful, cloud-based AI';
      case 'huggingface': return 'Hugging Face models - Open source AI models';
      case 'gemini': return 'Google Gemini - Advanced AI by Google';
      default: return 'AI Provider';
    }
  };

  const getDefaultModels = (providerType: string) => {
    switch (providerType) {
      case 'openai':
        return { model: 'gpt-3.5-turbo', embeddingModel: 'text-embedding-3-small' };
      case 'gemini':
        return { model: 'gemini-1.5-flash', embeddingModel: 'text-embedding-004' };
      case 'huggingface':
        return { model: 'microsoft/phi-2', embeddingModel: 'sentence-transformers/all-MiniLM-L6-v2' };
      case 'ollama':
        return { model: 'qwen2.5:3b', embeddingModel: 'nomic-embed-text', baseUrl: 'http://localhost:11434' };
      default:
        return { model: '', embeddingModel: '', baseUrl: '' };
    }
  };

  const handleProviderTypeChange = (providerType: string) => {
    const defaults = getDefaultModels(providerType);
    setNewConfig({
      ...newConfig,
      providerType: providerType as any,
      model: defaults.model,
      embeddingModel: defaults.embeddingModel,
      baseUrl: defaults.baseUrl,
    });
  };

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600 mb-8">Manage your account and AI provider configurations</p>

          {/* AI Provider Configuration */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">AI Provider Configuration</h2>
                <p className="text-slate-600 text-sm">
                  Configure and manage your AI providers for FAQ generation and chat responses
                </p>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Provider</span>
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-slate-600">Loading configurations...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {configs.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <p>No AI providers configured yet.</p>
                    <p className="text-sm">Click "Add Provider" to get started.</p>
                  </div>
                ) : (
                  configs.map((config) => (
                    <div
                      key={config.providerType}
                      className={`border-2 rounded-lg p-4 transition-all ${
                        config.isActive
                          ? 'border-green-500 bg-green-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="text-2xl mr-3">{getProviderIcon(config.providerType)}</span>
                            <div>
                              <h3 className="font-semibold text-slate-900 capitalize">
                                {config.providerType}
                                {config.isActive && (
                                  <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                                    Active
                                  </span>
                                )}
                              </h3>
                              <p className="text-sm text-slate-600">{getProviderDescription(config.providerType)}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                            <div>
                              <span className="font-medium">Model:</span> {config.model || 'Not set'}
                            </div>
                            <div>
                              <span className="font-medium">Embedding:</span> {config.embeddingModel || 'Not set'}
                            </div>
                            {config.baseUrl && (
                              <div className="col-span-2">
                                <span className="font-medium">Base URL:</span> {config.baseUrl}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => testConfig(config)}
                            disabled={testing}
                            className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {testing ? 'Testing...' : 'Test'}
                          </button>
                          <button
                            onClick={() => deleteConfig(config.providerType)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {testResult && (
              <div className={`mt-4 p-4 rounded-lg ${
                testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center">
                  {testResult.success ? (
                    <CheckIcon className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <XMarkIcon className="w-5 h-5 text-red-600 mr-2" />
                  )}
                  <span className={`font-medium ${
                    testResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {testResult.success ? 'Test Successful' : 'Test Failed'}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${
                  testResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {testResult.message}
                </p>
              </div>
            )}
          </div>

          {/* Add Provider Form */}
          {showAddForm && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Add AI Provider</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveConfig(newConfig);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Provider Type
                    </label>
                    <select
                      value={newConfig.providerType}
                      onChange={(e) => handleProviderTypeChange(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="openai">OpenAI</option>
                      <option value="gemini">Google Gemini</option>
                      <option value="huggingface">Hugging Face</option>
                      <option value="ollama">Ollama</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={newConfig.apiKey || ''}
                      onChange={(e) => setNewConfig({ ...newConfig, apiKey: e.target.value })}
                      placeholder="Enter your API key"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Chat Model
                    </label>
                    <input
                      type="text"
                      value={newConfig.model || ''}
                      onChange={(e) => setNewConfig({ ...newConfig, model: e.target.value })}
                      placeholder="Model name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Embedding Model
                    </label>
                    <input
                      type="text"
                      value={newConfig.embeddingModel || ''}
                      onChange={(e) => setNewConfig({ ...newConfig, embeddingModel: e.target.value })}
                      placeholder="Embedding model name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {newConfig.providerType === 'ollama' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Base URL
                      </label>
                      <input
                        type="text"
                        value={newConfig.baseUrl || ''}
                        onChange={(e) => setNewConfig({ ...newConfig, baseUrl: e.target.value })}
                        placeholder="http://localhost:11434"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={newConfig.isActive || false}
                    onChange={(e) => setNewConfig({ ...newConfig, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-slate-700">
                    Set as active provider
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Configuration'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {user.name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {user.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Plan</label>
                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg capitalize">
                  {user.plan}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;