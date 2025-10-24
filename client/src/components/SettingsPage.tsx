import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import axios from 'axios';

interface SettingsPageProps {
  user: any;
  onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onLogout }) => {
  const [activeProvider, setActiveProvider] = useState<string>('ollama');
  const [availableProviders, setAvailableProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProviderInfo();
  }, []);

  const fetchProviderInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/ai/provider', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setActiveProvider(response.data.activeProvider);
        setAvailableProviders(response.data.availableProviders);
      }
    } catch (error) {
      console.error('Error fetching provider info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = async (newProvider: string) => {
    setSaving(true);
    setTestResult(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/api/ai/provider',
        { provider: newProvider },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setActiveProvider(newProvider);
        alert(`✅ Successfully switched to ${newProvider}!`);
      }
    } catch (error: any) {
      alert(`❌ Failed to switch provider: ${error.response?.data?.error || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const testProvider = async (provider: string) => {
    setTesting(true);
    setTestResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/api/ai/provider/test',
        { provider },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTestResult(response.data);
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.response?.data?.error || error.message
      });
    } finally {
      setTesting(false);
    }
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'ollama':
        return '🖥️';
      case 'openai':
        return '🤖';
      case 'gemini':
        return '✨';
      case 'huggingface':
        return '🤗';
      default:
        return '🔧';
    }
  };

  const getProviderDescription = (type: string) => {
    switch (type) {
      case 'ollama':
        return 'Run AI models locally on your machine. Free, private, no API costs.';
      case 'openai':
        return 'Industry-leading AI from OpenAI. $5 free credit for new accounts. Best quality.';
      case 'gemini':
        return 'Google\'s AI model. Free tier available (15 req/min). Good quality.';
      case 'huggingface':
        return 'Open-source models. Free tier available. Good for testing.';
      default:
        return '';
    }
  };

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600 mb-8">Manage your account and AI provider preferences</p>
          
          {/* AI Provider Selection Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">AI Provider</h2>
            <p className="text-slate-600 text-sm mb-6">
              Choose which AI service to use for generating FAQs and answering questions
            </p>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {availableProviders.map((provider) => (
                  <div
                    key={provider.type}
                    className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                      activeProvider === provider.type
                        ? 'border-blue-500 bg-blue-50'
                        : provider.configured
                        ? 'border-slate-200 hover:border-blue-300'
                        : 'border-slate-200 opacity-50'
                    }`}
                    onClick={() => provider.configured && handleProviderChange(provider.type)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-3">{getProviderIcon(provider.type)}</span>
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {provider.name}
                              {activeProvider === provider.type && (
                                <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                                  Active
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-slate-600">{getProviderDescription(provider.type)}</p>
                          </div>
                        </div>
                        
                        {!provider.configured && (
                          <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded">
                            ⚠️ Not configured - Add API key to .env file
                          </div>
                        )}
                      </div>
                      
                      {provider.configured && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            testProvider(provider.type);
                          }}
                          disabled={testing}
                          className="ml-4 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {testing ? 'Testing...' : 'Test'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Test Results */}
            {testResult && (
              <div className={`mt-6 p-4 rounded-lg ${
                testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                {testResult.success ? (
                  <div>
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold text-green-900">Test Successful!</span>
                    </div>
                    <div className="text-sm text-green-800">
                      <p><strong>Chat:</strong> {testResult.chatTest.response.substring(0, 100)}</p>
                      <p><strong>Embeddings:</strong> {testResult.embeddingTest.dimensions} dimensions</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold text-red-900">Test Failed</span>
                    </div>
                    <p className="text-sm text-red-800">{testResult.error || testResult.details}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Account Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-900">
                  {user?.name || 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-900">
                  {user?.email || 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plan</label>
                <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-200 text-blue-900 font-semibold">
                  {user?.plan || 'Free'} Plan
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon Features */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">More Settings Coming Soon</h3>
              <p className="text-slate-600 mb-6">We're working on additional settings including:</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span className="font-semibold text-slate-900">Password Change</span>
                </div>
                <p className="text-sm text-slate-600">Update your account password</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="font-semibold text-slate-900">Notifications</span>
                </div>
                <p className="text-sm text-slate-600">Email and notification preferences</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="font-semibold text-slate-900">Team Management</span>
                </div>
                <p className="text-sm text-slate-600">Invite team members and manage roles</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span className="font-semibold text-slate-900">API Keys</span>
                </div>
                <p className="text-sm text-slate-600">Generate and manage API access keys</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;

